# coding: utf-8
'''Cookie write-protection.'''
from threading import Lock
from itsdangerous import Signer, BadSignature

from .config import config
from .log import logger

# 	pylint: disable=invalid-name
#	Create a log.
log = logger(__name__)
#	Create the signer and lock.
signer = Signer(config.security.cookie_secret)
signer_lock = Lock()
#	pylint: enable=invalid-name

#	Internal helpers.
def _create_get_secure_cookie(req):
	'''Create and return a write-protected cookie read method.'''
	def get_secure_cookie(key):
		value = req.cookies.get(key)
		if value:
			try:
				return signer.unsign(value).decode('utf-8')
			except BadSignature:
				log.warning('Bad signature for cookie %s', value)
		return None
	return get_secure_cookie

def _create_set_secure_cookie(resp):
	'''Create and return a write-protected cookie write method.'''
	def set_secure_cookie(key, value):
		signer_lock.acquire()
		locked_value = signer.sign(str(value)).decode('utf-8')
		signer_lock.release()
		log.debug('Cookie locked %s => %s', value, locked_value)

		resp.set_cookie(
			key, locked_value, secure=not config.development.debug, path='/'
		)
	return set_secure_cookie

#	Middleware.
class SecureCookieMiddleware:
	'''A middleware that applies write-protected read and write methods for
	cookies on the request.'''

	def process_request(self, req, resp):
		'''Attach the write-protected cookie methods.'''
		req.get_secure_cookie = _create_get_secure_cookie(req)
		resp.set_secure_cookie = _create_set_secure_cookie(resp)
