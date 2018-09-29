# coding: utf-8
'''Responder expectation declaration and enforcement. By default, all 
responders expected JSON withing the configured maximum size.'''
from .config import config
from .errors import MethodNotAllowed, UnsupportedMediaType, PayloadTooLarge

#	Define the set of supported methods.
ALLOWED_METHODS = ('get', 'post', 'put', 'delete', 'patch')

#	Decorators.
def expect(mimetype='json', max_length=config.security.max_content_length):
	'''A decoratior responder methods can use to declare that either:
	*	They don't expect JSON.
	*	They allow a higher-than-normal content length.'''
	def expectation_bound(meth):
		'''Bind the expectation to the responder.'''
		# pylint: disable=protected-access
		meth._expects_mimetype = mimetype
		meth._expects_max_length = max_length
		return meth

	return expectation_bound

#	Classes.
class ExpectationMiddleware:
	'''MIME type and Content-Type expectation enforcement.'''

	#	pylint: disable=unused-argument
	def process_resource(self, req, resp, resource, params):
		'''Ensure the client has met the expectations of the responder.'''
		responder = getattr(resource, 'on_%s'%req.method.lower())

		#	Maybe die on method.
		#	TODO: Assert this is a case.
		if not responder:
			#	Collect methods that *are* allowed.
			allowed_here = list()
			for meth_name in ALLOWED_METHODS:
				if getattr(resource, 'on_%s'%meth_name):
					allowed_here.append(meth_name)
			#	Raise.
			raise MethodNotAllowed(allowed_here)

		#	Check if payload expected.
		if req.method == 'GET':
			return

		#	Check mimetype.
		expected_mimetype = getattr(responder, '_expects_mimetype', 'json')
		declared_mimetype = req.get_header('Content-Type')
		if not declared_mimetype or expected_mimetype not in declared_mimetype:
			raise UnsupportedMediaType()

		#	Check content length.
		max_length = getattr(
			responder, '_expects_max_length', 
			config.security.max_content_length
		)
		declared_length = req.get_header('Content-Length')
		if not declared_length or declared_length > max_length:
			raise PayloadTooLarge()
