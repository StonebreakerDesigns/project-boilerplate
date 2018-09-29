# coding: utf-8
'''Boilerplate for an API powered by Falcon and SQLAlchemy over Postgres. This
root module exports `application`, the uWSGI application, and `serve()`, a
function. that can be used for debugging service.'''
import os
import sys

from werkzeug import serving

#	Declare version.
__version__ = '0.1a'

from .config import config
from .log import logger
from .db import create_models
from .api_factory import create_api

#	Create a logger.
log = logger(__name__) #	pylint: disable=invalid-name

#	Import endpoints.
from .users import AuthEndpoint, UserCollectionEndpoint, \
	UserInstanceEndpoint, PasswordResetEndpoint, PasswordResetRequestEndpoint

#	Initialize system.
create_models()

#	Create WSGI application.
application = create_api({ #	pylint: disable=invalid-name
	'/users': UserCollectionEndpoint(),
	'/users/{id:uuid}': UserInstanceEndpoint(),
	'/auth': AuthEndpoint(),
	'/auth/request-password-reset': PasswordResetRequestEndpoint(),
	'/auth/password-reset': PasswordResetEndpoint()
})

#	Define debug helper.
def serve(port=None):
	'''A debugging service function.'''
	if not port:
		port = 7990
	serving.run_simple('0.0.0.0', port, application, use_reloader=True)

#	Ready to go!
log.info('API server %s initialized', __version__)
