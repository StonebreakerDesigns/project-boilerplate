# coding: utf-8
'''Centralized falcon uWSGI application object creation.'''
import json
import falcon

from traceback import format_exception
from falcon_cors import CORS as CORSPolicy
from falcon_multipart.middleware import MultipartMiddleware

from .errors import InternalServerError
from .config import config
from .log import logger
from .expectation import ExpectationMiddleware
from .json_ext import JSONMiddleware

#	Success status map.
SUCCESS_STATUS_MAP = {
	200: '200 OK',
	201: '201 Created',
	202: '202 Accepted'
}

class IntStatusMiddleware:
	'''A middleware that allows pure integers to be used as success status
	codes by responders.'''

	def process_response(self, req, resp, resource, succeeded):
		'''Convert int success status codes to strings.'''
		#	Ensure there's anything to do.
		if not succeeded or not isinstance(resp.status, int):
			return

		resp.status = SUCCESS_STATUS_MAP[resp.status]

def create_api(routing, routing_converters=None):
	'''Create, configure, populate and return a falcon API object.

	:param routing: A dictionary containing the route to endpoint instance
	mapping with which to populate the API.
	:param routing_converters: A map of route-converter keys to converter
	objects. See the falcon documentation for more about in-route variable
	conversion.
	'''
	#	Configure CORS.
	cors_policy = CORSPolicy(
		**config.security.cors_policy.__data # pylint: disable=protected-access
	)
	#	Create an application.
	application = falcon.API(middleware=list((
		cors_policy.middleware,
		IntStatusMiddleware(),
		ExpectationMiddleware(),
		MultipartMiddleware(),
		JSONMiddleware()
	)))

	#	Create a root logger.
	log = logger('api:root')

	#	pylint: disable=unused-argument
	def handle_uncaught_exception(ex, req, resp, params):
		'''A root exception handler that ensures 500s are returned in the event
		of an internal server error.'''
		#	Re-raise HTTP-status-correspondant exceptions.
		if isinstance(ex, falcon.HTTPError):
			raise ex

		#	Log the error and raise a 500.
		log.critical('Internal server error:')
		log.critical(''.join(format_exception(type(ex), ex, ex.__traceback__)))
		raise InternalServerError()

	#	Force JSON error responses.
	def serialize_exception_as_json(req, resp, ex):
		'''Supply a JSON representation of the error to the response.'''
		resp.body = json.dumps(ex.to_dict())
		resp.content_type = 'application/json'
		resp.append_header('Vary', 'Accept')

	#	Register.
	application.add_error_handler(BaseException, handle_uncaught_exception)
	application.set_error_serializer(serialize_exception_as_json)

	#	Populate the routing converters if there are any.
	if routing_converters:
		for key, converter_cls in routing_converters.items():
			application.router_options.converters[key] = converter_cls

	#	Populate the routing.
	for route, endpoint in routing.items():
		#	Maybe regionalize the root.
		route = ''.join((config.env.api_route_prefix, route))

		application.add_route(route, endpoint)

	return application
