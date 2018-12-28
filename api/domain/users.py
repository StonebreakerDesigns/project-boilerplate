# coding: utf-8
'''User accounts, authentication, and authorization.'''
import uuid

from datetime import datetime, timedelta

from ..config import config
from ..errors import SecurityError, Unauthorized, Forbidden, BadRequest, \
	UnprocessableEntity
from ..log import logger
from ..db import Model, Column, PrimaryKeyColumn, ForeignKeyColumn, DateTime, \
	EmailType, PasswordType, Text, Enum, UUID, Boolean, IntegrityError, \
	relationship, get_error_description, query_and, with_session, \
	contains_eager, dictize_attrs
from ..emails import send_email

#	Define the set of allowed user types.
ALLOWED_USER_TYPES = ('basic', 'admin')
CONSTRAINT_DESC_MAP = {'email_address': 'That email address is taken'}

#	Create a logger.
log = logger(__name__)

#	Internal helpers.
#	pylint: disable=protected-access
def _session_timeout_generator():
	'''An authentication session timeout schedule generator.'''
	return datetime.now() + timedelta(
		**config.security.session_timeout.__data
	)
def _password_reset_timeout_generator():
	'''A password reset token timeout schedule generator.'''
	return datetime.now() + timedelta(
		**config.security.password_reset_grace.__data
	)
#	pylint: enable=protected-access

#	Decorator.
def authenticate(*args, **kwargs):
	'''A decorator that adds an authentication precondition to a responder.
	Must follow the `db.with_session` decorator. The keyword argument `authz`
	can specify an authorization requirement. If it isn't, the decorator
	should be used without a call.'''
	#	Define the extender.
	def meth_extender(meth):
		'''Extend a method with this decorators functionality.'''
		#	Get required type.
		authz_requirement = kwargs.get('type')
		def meth_with_auth(*meth_args, **meth_kwargs):
			'''The replacement method.'''
			user = User.get_authenticated_or_die(meth_args[1], meth_args[-1])

			#	Assert authz.
			if authz_requirement and user.type != authz_requirement:
				raise Forbidden(message='Only users of type %s can do that'%(
					authz_requirement
				))

			#	Call.
			return meth(*meth_args, user, **meth_kwargs)
		return meth_with_auth

	#	Handle appropriate variant.
	if kwargs:
		return meth_extender
	return meth_extender(args[0])

#	Models.
class User(Model):
	'''A user.'''
	#	Describe table.
	#	pylint: disable=bad-continuation, bad-whitespace
	__tablename__       = 'users'
	id                  = PrimaryKeyColumn()
	type                = Column(Enum(
							*ALLOWED_USER_TYPES, name='user_types'
						  ), nullable=False, default='basic')
	email_address       = Column(EmailType(), unique=True, nullable=False)
	password            = Column(PasswordType(Text, \
							schemes=('pbkdf2_sha512',)), nullable=False)
	api_key             = Column(UUID(as_uuid=True), nullable=False,
						  	default=uuid.uuid4)
	created_at          = Column(DateTime, nullable=False,
							default=datetime.now)
	#	pylint: enable=bad-continuation, bad-whitespace

	def __init__(self, email_address, password):
		self.email_address = email_address
		self.password = password

	@classmethod
	def get_for_session_key(cls, key, sess):
		'''Return the user associated with the given non-expired session `key`
		or `None`.'''
		user_session = sess.query(UserSession).options(
			contains_eager(UserSession.user)
		).filter(query_and(
			UserSession.key == key,
			UserSession.where_current()
		)).first()
		return user_session.user if user_session else None

	@classmethod
	def get_by_email_address(cls, email_address, sess):
		'''Return the user with the given email address.'''
		return sess.query(cls).filter(
			cls.email_address == email_address
		).first()

	@classmethod
	def get_authenticated_or_die(cls, req, sess):
		'''Return the user currently authenticated for the given `req` or raise
		a canonical exception.'''
		user = cls.get_authenticated(req, sess)
		if not user:
			raise Unauthorized(message='You must be logged in to do that')

		return user

	@classmethod
	def get_authenticated(cls, req, sess):
		'''Return the user currently authenticated for the given `req` or
		`None`.'''
		#	Try API key authentication.
		api_key = req.get_header(config.security.api_key_header)
		if api_key:
			#	Try to cast.
			try:
				api_key = uuid.UUID(api_key)
			except:
				raise BadRequest(message='Invalid API Key')

			#	Return the user or raise an appropriate error for this scheme.
			user = sess.query(cls).filter(cls.api_key == api_key).first()
			if user is None:
				raise Unauthorized(message='Invalid API Key')

			return user

		#	Retrieve the authentication token and assert it exists.
		auth_tkn = req.cookies.get(config.security.auth_cookie_key)
		if auth_tkn:
			#	Retrieve and return the user or `None`.
			return cls.get_for_session_key(auth_tkn, sess)

		#	No authentication provided.
		return None

	def authorize_session(self, resp, sess):
		'''Authorize this user by modifying the given `req` to store a session
		token in the configured cookie key.'''
		user_session = UserSession(self.id)
		sess.add(user_session)

		resp.set_cookie(
			config.security.auth_cookie_key, str(user_session.key),
			secure=not config.development.debug
		)

	def dictize(self, user): #	pylint: disable=unused-argument
		'''Return a dictization of the user.'''
		#	Don't expose sensitive info!
		if not user or not (user is self or user.type == 'admin'):
			raise SecurityError()

		return dictize_attrs(self, user, (
			'id', 'type', 'email_address', 'api_key', 'created_at'
		))

class UserSession(Model):
	'''A `UserSession` is an expiring token based authentication scheme. The
	key of a user's current authentication session is stored in their cookie
	session.
	This class should almost never be referenced directly; use the
	`@authenticate` decorator for everyday needs.'''
	#	Describe table.
	#	pylint: disable=bad-continuation, bad-whitespace
	__tablename__   = 'user_sessions'
	key             = PrimaryKeyColumn()
	expiry          = Column(DateTime(), nullable=False, \
						default=_session_timeout_generator)
	user_id         = ForeignKeyColumn('users.id', nullable=False)
	canceled        = Column(Boolean(), nullable=False, default=lambda: False)
	#	Relationships.
	user            = relationship('User', lazy='joined')
	#	pylint: enable=bad-continuation, bad-whitespace

	def __init__(self, user_id):
		'''Reserved for module-internal use.'''
		self.user_id = user_id
		#	Eagerly set key.
		self.key = uuid.uuid4()

	@classmethod
	def get_by_key(cls, key, session):
		'''Return the user session for the given key.'''
		return session.query(cls).filter(query_and(
			cls.key == key, cls.where_current()
		)).first()

	@classmethod
	def where_current(cls):
		'''Return a query condition specifying a session that is not expired.'''
		return query_and(cls.expiry >= datetime.now(), cls.canceled == False)

	def cancel(self):
		'''Cancel this session. Once a session is canceled, the authentication
		API will never expose that session again.'''
		self.canceled = True

class PasswordResetToken(Model):
	'''Password reset tokens are sent in links to account emails.'''
	#	Describe table.
	#	pylint: disable=bad-continuation, bad-whitespace
	__tablename__   = 'password_reset_tokens'
	key             = PrimaryKeyColumn()
	expiry          = Column(DateTime(), nullable=False, \
						default=_password_reset_timeout_generator)
	user_id         = ForeignKeyColumn('users.id', nullable=False)
	used            = Column(Boolean, nullable=False, default=False)
	#	Relationships.
	user            = relationship('User')
	#	pylint: enable=bad-continuation, bad-whitespace

	def __init__(self, user_id):
		'''Reserved for module-internal use.'''
		self.user_id = user_id

	@classmethod
	def get_by_key(cls, key, sess):
		'''Return the unexpired, unused reset token with key `key`. The caller
		must mark the key as used.'''
		return sess.query(cls).filter(query_and(
			cls.key == key, cls.expiry > datetime.now(), cls.used == False
		)).first()

#	Endpoints.
class UserCollectionEndpoint:
	'''User creation and collection retrieval for admins.'''

	@with_session
	def on_post(self, req, resp, sess):
		'''Create a user given a JSON payload in the request.'''
		#	Assert password confirmation.
		password = req.json[('password', str)]
		if password != req.json['confirm_password']:
			raise UnprocessableEntity(
				message="Passwords didn't match", offender='confirm_password'
			)

		#	Create the user.
		user = User(req.json[('email_address', str)], password)
		sess.add(user)

		#	Try and create.
		try:
			sess.commit()
		except IntegrityError as ex:
			#	Return a relevant error description.
			desc = get_error_description(ex, CONSTRAINT_DESC_MAP)

			raise UnprocessableEntity(message=desc) from None

		#	Authenticate and persist.
		user.authorize_session(resp, sess)
		sess.commit()

		#	Respond.
		resp.status = 201
		resp.json = {'created_id': user.id}

class UserInstanceEndpoint:
	'''User instance resource. Must be routed with a UUID parameter.'''

	@with_session
	@authenticate
	def on_put(self, req, resp, sess, user, id=None):
		'''Update user details.'''
		#	Assert authz.
		if user.type != 'admin' and user.id != id:
			raise Unauthorized(message="You can't do that")

		#	Retrieve user to edit.
		to_edit = User.rest_get(id, sess)

		#	Perform edits.
		if 'email_address' in req.json:
			to_edit.email_address = req.json[('email_address', str)]
		if 'password' in req.json:
			#	Assert this-instant auth.
			if to_edit.password != req.json[('current_password', str)]:
				raise Unauthorized(message='Incorrect password')

			password, confirm = (
				req.json[('password', str)], req.json['confirm_password']
			)
			if password != confirm:
				raise UnprocessableEntity(message="Passwords didn't match")
			#	Set new password.
			to_edit.password = password
		#	XXX: Add project-specific self edit cases.

		#	Save the changes.
		try:
			sess.commit()
		except IntegrityError as ex:
			desc = get_error_description(ex, CONSTRAINT_DESC_MAP)

			raise UnprocessableEntity(message=desc) from None

class AuthEndpoint:
	'''The authentication endpoint for inspection, login, and logout.'''

	@with_session
	def on_get(self, req, resp, sess):
		'''Return a JSON playload that describes the currently authenticated
		user under its "user" key.'''
		user = User.get_authenticated(req, sess)

		if user:
			#	Return a representation of the user.
			resp.json = user.dictize(user)
		else:
			#	Return a "failure" statused JSON.
			resp.failure_json = True

	@with_session
	def on_post(self, req, resp, sess):
		'''Create a new authentication session given a JSON payload containing
		valid login credentials.'''
		#	Assert no session exists.
		if User.get_authenticated(req, sess):
			raise Unauthorized(message="You're already logged in")

		#	Assert user exists and password is valid.
		user = User.get_by_email_address(req.json['email_address'], sess)
		if not user or user.password != req.json['password']:
			raise Unauthorized(message="Incorrect username or password")

		#	Authorize a new session.
		user.authorize_session(resp, sess)
		sess.commit()

	@with_session
	def on_delete(self, req, resp, sess):
		'''Delete the current authentication session (i.e. log out).'''
		#	Retrieve the session key and assert it exists.
		cookie_key = config.security.auth_cookie_key
		auth_tkn = req.cookies.get(cookie_key)
		if not auth_tkn:
			raise Unauthorized()

		#	Retrieve the user session and assert it exists.
		user_session = UserSession.get_by_key(auth_tkn, sess)
		if not user_session:
			raise Unauthorized()

		#	Cancel the user session.
		user_session.cancel()
		sess.commit()

		resp.unset_cookie(cookie_key)

#	TODO: Wipe all active tokens on success.
class PasswordResetEndpoint:
	'''Password reset machinery. POST to create token, PUT to use.'''

	@with_session
	def on_put(self, req, resp, sess):
		'''Reset the password of the user to which the token supplied in the
		request JSON is associated. The JSON must also include a new
		password.'''
		#	Parse request body.
		token_key = req.json[('reset_token', uuid.UUID)]
		new_password = req.json[('password', str)]

		#	Assert the passwords match.
		if new_password != req.json['confirm_password']:
			raise UnprocessableEntity(message="Passwords didn't match")

		#	Retrieve the token.
		token = PasswordResetToken.get_by_key(token_key, sess)
		if not token:
			raise UnprocessableEntity(
				message='That reset link has expired or does not exist'
			)

		#	Reset the password.
		token.user.password = new_password
		token.used = True
		sess.commit()

	@with_session
	def on_post(self, req, resp, sess):
		'''Send a password reset link to the email specified in the request
		JSON, if it is registered.'''
		#	Parse request body.
		email_address = req.json[('email_address', str)]

		user = User.get_by_email_address(email_address, sess)
		if not user:
			return

		#	Create the token and send an email to the user containing a
		#	link to the reset page.
		token = PasswordResetToken(user.id)
		sess.add(token)
		sess.commit()

		#	Create the reset link.
		reset_url = '%s%s/%s?r=%s'%(
			config.env.site_protocol, config.env.site_domain, 'reset-password',
			str(token.key)
		)

		#	Send the email.
		send_email(
			to=user.email_address,
			subject='Your password reset link',
			template='password-reset.html',
			context={'reset_url': reset_url}
		)

class LocalSessionCheckEndpoint:
	'''An endpoint exposed only to the app to check authentication sessions.'''

	@with_session
	def on_get(self, req, resp, sess):
		'''Return the user type for the current user if there is one.'''
		#	Check input.
		cookie_val = req.get_secure_cookie(config.security.auth_cookie_key)
		log.debug('Session check %s', cookie_val)
		if not cookie_val:
			resp.json = {'type': None}
			return

		try:
			auth_sess_id = uuid.UUID(cookie_val)
		except ValueError:
			raise BadRequest(message='No.')

		#	Retrieve and assert any.
		row = sess.query(User.id, User.type)\
			.join(UserSession).filter(query_and(
				UserSession.key == auth_sess_id,
				UserSession.where_current()
			)).first()
		if not row:
			resp.json = {'type': None}
			return

		#	Describe.
		resp.json = {'type': row[1]}
