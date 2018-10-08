# coding: utf-8
'''Responder expectation declaration and enforcement. By default, all 
responders expected JSON withing the configured maximum size.'''
from .config import config
from .errors import MethodNotAllowed, UnsupportedMediaType, PayloadTooLarge, \
	BadRequest

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
		if not responder:
			#	Collect methods that *are* allowed.
			allowed_here = list()
			for meth_name in ALLOWED_METHODS:
				if getattr(resource, 'on_%s'%meth_name, None):
					allowed_here.append(meth_name)
			#	Raise.
			raise MethodNotAllowed(allowed_here)

		#	Check if payload expected.
		if req.method == 'GET':
			return

		#	Check mimetype.
		expected_mimetype = getattr(responder, '_expects_mimetype', 'json')
		declared_mimetype = req.get_header('Content-Type')
		#	Skip JSON because the JSON middleware handles it.
		#	pylint: disable=bad-continuation
		if expected_mimetype != 'json' and (
			not declared_mimetype or
			expected_mimetype not in declared_mimetype
		):
			raise UnsupportedMediaType()
		#	pylint: enable=bad-continuation

		#	Check content length.
		max_length = getattr(
			responder, '_expects_max_length', 
			config.security.max_content_length
		)
		declared_length = req.get_header('Content-Length')
		#	Try to cast to int.
		try:
			declared_length = int(declared_length)
		except TypeError:
			raise BadRequest(message='Invalid Content-Length value')
		if declared_length > max_length:
			raise PayloadTooLarge()
