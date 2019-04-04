# coding: utf-8
'''Visitor tracking.'''
import uuid

from datetime import datetime

from ..config import config
from ..db import Session, Model, PrimaryKeyColumn, Column, Text, DateTime

#   Constants.
VISITOR_ID_CTX_KEY = 'visitor_id'

#   Models.
class VisitorSession(Model):
	'''A cookie session for visitor tracking.'''
	#	Describe table.
	#	pylint: disable=bad-continuation, bad-whitespace
	__tablename__	    = 'visitor_sessions'
	id				    = PrimaryKeyColumn()
	started_by_ip	    = Column(Text, nullable=False)
	created_at		    = Column(DateTime, nullable=False, 
							default=datetime.now)
	#	pylint: enable=bad-continuation, bad-whitespace

	def __init__(self, ip):
		self.started_by_ip = ip

	@classmethod
	def get_current(cls, req, sess):
		'''Return the visitor session for the given request.'''
		return cls.get(req.context[VISITOR_ID_CTX_KEY], sess)

#	Middlewares.
class VisitorWatchMiddleware:
	'''Visitor tracking middleware. This middleware enforces the invariant that
	all requests have a valid visitor ID associated (below it in the stack).'''

	def process_request(self, req, resp):
		'''Ensure there's a visitor session associated with this request.'''
		#	Alias config.
		cookie_key = config.client_keys.visitor_cookie_key

		#	Fetch cookie.
		visitor_tkn = req.get_secure_cookie(cookie_key)
		visitor_exists = False
		visitor_id = None
		#	Create a session.
		sess = Session()

		if visitor_tkn:
			#	Ensure token is a UUID.
			try:
				visitor_id = uuid.UUID(visitor_tkn)
			except ValueError: pass

			#	Ensure token relates to database record.
			if visitor_id:
				visitor_exists = sess.query(VisitorSession).filter(
					VisitorSession.id == visitor_id
				).count() > 0

		#	Maybe create a new session.
		if not visitor_exists:
			created = VisitorSession(req.access_route[0])
			sess.add(created)
			sess.commit()
			#	Add to cookie session.
			visitor_id = created.id
			resp.set_secure_cookie(cookie_key, created.id)

		req.context[VISITOR_ID_CTX_KEY] = visitor_id
		#	Cleanup.
		sess.close()
