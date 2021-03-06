# coding: utf-8
'''Centralized database control and SQLAlchemy namespace aggregation.'''
#	Disable unused imports because this is a namespace.
#	pylint: disable=unused-import
import uuid

#	Import SQLAlchemy machinery and common objects to be imported from here.
from sqlalchemy import Column, ForeignKey, and_ as query_and, \
	or_ as query_or, create_engine as _create_engine
from sqlalchemy.sql import text as raw_sql
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import relationship, reconstructor, \
	sessionmaker as _sessionmaker, contains_eager
from sqlalchemy.types import JSON, DateTime, Text, Integer, Boolean, Enum, \
	Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import CheckConstraint
from sqlalchemy.ext.declarative import declarative_base as _declarative_base
from sqlalchemy_utils import EmailType, PasswordType

from .config import config
from .errors import BadRequest, NotFound
from .log import logger

#	Create a logger.
log = logger(__name__) # pylint: disable=invalid-name

#	pylint: disable=invalid-name
#	Create the universal SQLAlchemy database connection string.
database_connection_str = 'postgresql+psycopg2://%s:%s@localhost/%s'%(
	config.database.user, config.database.password,
	config.database.database
)

#	Initialize SQLAlchemy interface.
_engine = _create_engine(
	database_connection_str, 
	echo=config.development.echo_sql
)
Session = _sessionmaker(bind=_engine)
#	pylint: enable=invalid-name

#	Classes.
class _Model:
	id = None

	@classmethod
	def id_check(cls, check_id, sess):
		'''Return whether or not an instance exists with the given ID.'''
		return sess.query(cls).filter(cls.id == check_id).count() > 0

	@classmethod
	def rest_id_check(cls, check_id, sess):
		'''Return that an instance exists with the given ID or raise a 404.'''
		if not cls.id_check(check_id, sess):
			raise NotFound()
		return True

	@classmethod
	def get(cls, check_id, sess):
		'''Return the instance of a model with the given ID or `None`.'''
		return sess.query(cls).filter(cls.id == check_id).first()

	@classmethod
	def rest_get(cls, check_id, sess):
		'''Return the instance of a model with the given ID or raise a 404.'''
		inst = cls.get(check_id, sess)
		if inst is None:
			raise NotFound()
		return inst

	def dictize(self, user=None):
		'''The dictization method. `user` should always be checked to ensure 
		data exposure is okay, even if you're securing it elsewhere.'''
		raise NotImplementedError()
Model = _declarative_base(cls=_Model)

#	Helpers.
def PrimaryKeyColumn(): # pylint: disable=invalid-name
	'''A canonical UUID primary key column.'''
	return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

def ForeignKeyColumn(target, **kwargs): # pylint: disable=invalid-name
	'''A foreign key to a canonical UUID primary key column.'''
	return Column(UUID(as_uuid=True), ForeignKey(target), **kwargs)

def dictize_attrs(obj, user, attrs):
	'''Return a dictization of `obj` containing for the given attribute set.

	:param obj: The object to dictize.
	:param user: The currently authenticated user.
	:param attrs: An iterable of attributes to dictize.'''
	#	Define recursion helper.
	def dictize_models(item):
		if isinstance(item, Model):
			return item.dictize(user)
		elif isinstance(item, (list, tuple)):
			return list(
				dictize_models(sub_item) for sub_item in item
			)
		else:
			return item

	#	Recursively dictize the attributes.
	data_dict = dict()
	for attr in attrs:
		data_dict[attr] = dictize_models(getattr(obj, attr))
	return data_dict

def get_error_description(ex, desc_map):
	'''Given a map of column names to error descriptions and an 
	`IntegrityError`, return the correct description of the error.'''
	ex_str = str(ex).split('DETAIL:')[0]
	for column_name, desc in desc_map.items():
		if column_name in ex_str:
			return desc

	raise Exception('Failed to identify error column in %s'%ex_str)

def create_models():
	'''Create all registered models.'''
	Model.metadata.create_all(_engine)

def with_session(meth):
	'''A decorator that passes a database session as an additional argument and
	handles cleaning it up after the method is executed.'''
	def meth_with_session_provided(*args, **kwargs):
		session = Session()
		try:
			ret_val = meth(*args, session, **kwargs)
			session.close()
			return ret_val
		except BaseException as ex:
			session.close()
			raise ex
	return meth_with_session_provided
