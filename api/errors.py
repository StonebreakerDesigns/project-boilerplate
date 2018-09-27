# coding: utf-8
'''Custom HTTP-status-correspondant errors. Should always be used in favor of
falcon's implementations.'''
import falcon

class CanonicalHTTPError(falcon.HTTPError):
	'''The base class of all custom HTTP-status correspondant errors.'''

	def __init__(self, status_code, status_str, kwargs):
		'''Define an overriding HTTP exception.'''
		super().__init__(str(status_code))
		self.status_code, self.status_str = status_code, status_str
		self.message = kwargs.get('message')
		self.other_data = kwargs.get('other_data')
		self.headers = kwargs.get('headers')

	def to_dict(self, obj_type=dict):
		'''Create a dictization of this error.'''
		data = obj_type()
		data['status'] = self.status_str
		data['status_code'] = self.status_code

		#	Maybe add a message.
		if self.message:
			data['message'] = self.message
		#	Maybe add any additional data.
		if self.other_data:
			for key, value in self.other_data.items():
				data[key] = value

		return data

class InternalServerError(CanonicalHTTPError):
	'''A *classic*.'''

	def __init__(self, **kwargs):
		'''Create a new 500.'''
		super().__init__(500, 'Internal Server Error', kwargs)

class BadRequest(CanonicalHTTPError):
	'''When you can't understand the request.'''

	def __init__(self, **kwargs):
		'''Create a new 400.'''
		super().__init__(400, 'Bad Request', kwargs)

class Unauthorized(CanonicalHTTPError):
	'''When the user hasn't provided sufficient authentication.'''

	def __init__(self, **kwargs):
		'''Create a new 401.'''
		super().__init__(401, 'Unauthorized', kwargs)

class PaymentRequired(CanonicalHTTPError):
	'''When the user hasn't coughed it up.'''

	def __init__(self, **kwargs):
		'''Create a new 402.'''
		super().__init__(402, 'Payment Required', kwargs)

class Forbidden(CanonicalHTTPError):
	'''When the user doesn't hold sufficient authorization.'''

	def __init__(self, **kwargs):
		'''Create a new 403.'''
		super().__init__(403, 'Forbidden', kwargs)

class NotFound(CanonicalHTTPError):
	'''When you can't find the requested resource.'''

	def __init__(self, **kwargs):
		'''Create a new 404.'''
		super().__init__(404, 'Not Found', kwargs)

class UnprocessableEntity(CanonicalHTTPError):
	'''When you understand the request but don't like it.'''

	def __init__(self, **kwargs):
		'''Create a new 422.'''
		super().__init__(422, 'Unprocessable Entity', kwargs)
