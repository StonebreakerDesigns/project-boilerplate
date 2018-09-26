# coding: utf-8
'''Centralized falcon UWSGI application object creation.'''
import json
import falcon

from traceback import format_exception
from falcon_cors import CORS
from falcon_multipart.middleware import MultipartMiddleware

from .errors import InternalServerError
from .config import config
from .log import logger

def create_api(routing, routing_converters):
	'''
	Create, configure, populate and return a falcon API object.
	::routing A dictionary containing the route to endpoint instance mapping
		with which to populate the API.
	'''
	#	Create an application with the configured CORS policy and multipart 
	#	form support.
	cors_policy = CORS(**config['cors_policy'])
	application = falcon.API(middleware=list((
		cors_policy.middleware, 
		MultipartMiddleware()
	)))
	
	#	Add a canonical base error handler.
	log = logger('mac-api')
	def _handle_uncaught_exceptions(ex, req, resp, params):
		if isinstance(ex, falcon.HTTPError):
			raise ex
		
		log.critical('Internal server error:')
		log.critical(''.join(format_exception(type(ex), ex, ex.__traceback__)))
		raise InternalServerError()
	def _serialize_as_json(req, resp, ex):
		resp.body = json.dumps(ex.to_dict())
		resp.content_type = 'application/json'
		resp.append_header('Vary', 'Accept')
	application.add_error_handler(BaseException, _handle_uncaught_exceptions)
	application.set_error_serializer(_serialize_as_json)

	#	Populate the routing converters.
	for key, converter_cls in routing_converters.items():
		application.router_options.converters[key] = converter_cls

	#	Populate the application's routing.
	for route, endpoint in routing.items():
		#	XXX: This won't be needed in a subdomained API prod. config.
		route = '/api' + route

		application.add_route(route, endpoint)

	return application
