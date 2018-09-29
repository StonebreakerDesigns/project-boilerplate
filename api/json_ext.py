# config: utf-8
'''Utilities for working with JSON.'''
import json
import uuid

from datetime import datetime
from json.decoder import JSONDecodeError

from .errors import BadRequest

def ext_serializer(obj):
	'''A fallback serializer for common types.'''
	if isinstance(obj, uuid.UUID):
		return str(obj)
	elif isinstance(obj, datetime):
		return obj.strftime('%Y-%m-%dT%H:%M:%S')

	raise TypeError(type(obj))

class JSONMiddleware:
	'''Middleware that provides `req.json` and generates request bodies
	from `resp.json` where relevant.'''

	#	pylint: disable=unused-argument
	def process_resource(self, req, resp, resource, params):
		'''Ensure the client has supplied a JSON payload if one was 
		expected.'''
		#	Ensure this is a payload-friendly verb.
		if req.method == 'GET':
			return

		#	Ensure the responder expects JSON.
		responder = getattr(resource, 'on_%s'%req.method.lower())
		if not getattr(responder, '_expects_mimetype', 'json') == 'json':
			return

		#	Attach the JSON to the requests such that invalid payloads are
		#	implicitly rejected.
		req.json = RequestJSON(req)

	def process_response(self, req, resp, resource, succeeded):
		'''Serialize response JSON if specified.'''
		#	Ensure there's anything to do.
		if not succeeded:
			return

		#	Create JSON payload.
		was_failure = getattr(resp, 'failure_json', False)
		full_json = {'status': 'failure' if was_failure else 'success'}
		if hasattr(resp, 'json'):
			full_json['data'] = resp.json
		#	Serialize.
		resp.body = json.dumps(full_json, default=ext_serializer)

class RequestJSON:
	'''A class used to parse and supply JSON request payloads that
	automatically handles client errors w.r.t. request content.'''

	def __init__(self, req=None, data_dict=None):
		'''Create and return a new parsed representation of the JSON body of 
		`req` or a similar dictionary populated with the contents of 
		`data_dict`.'''
		if data_dict is not None:
			#	Direct population.
			self.__data = data_dict
		elif req is not None:
			#	Parse data from request payload.
			try:
				pre_data = req.stream.read()
				if isinstance(pre_data, bytes):
					pre_data = pre_data.decode()

				#	Defer load.
				self.__fetch_data = lambda: json.loads(pre_data)
			except JSONDecodeError:
				raise BadRequest(message='Invalid JSON in request body') \
					from None
		else:
			raise ValueError('Must have initial content')

	def _wrap_semiprimitives(self, obj):
		'''Iterate a datastructure of lists and dicts, wrapping all encountered
		`dict`s in `RequestJSON` instances.'''
		if isinstance(obj, dict):
			return RequestJSON(data_dict=obj)
		elif isinstance(obj, (list, tuple)):
			return list(
				self._wrap_semiprimitives(sub_item) for sub_item in obj
			)
		return obj

	@property
	def data(self):
		if not hasattr(self, '__data'):
			self.__data = self.__fetch_data()

		return self.__data	

	def __getitem__(self, key_and_type):
		'''Retrieved items can be in the form of a (key, type) tuple.'''
		typ = str
		if isinstance(key_and_type, (list, tuple)):
			key, typ = key_and_type
		else:
			key = key_and_type

		#	Check presence.
		if key not in self.data:
			raise BadRequest(message='Missing key in request body: %s'%key)

		#	Check type, safely casting UUIDs.
		value = self.data[key]
		if typ is uuid.UUID:
			try:
				value = uuid.UUID(value)
			except:
				raise BadRequest(message='Incorrect ID format: %s'%value)
		if not isinstance(value, typ):
			raise BadRequest(message='Incorrect value type for key: %s'%key)

		#	Wrap dictionaries.
		return self._wrap_semiprimitives(value)

	def __contains__(self, key):
		return key in self.data

	def items(self):
		return self.data.items()
