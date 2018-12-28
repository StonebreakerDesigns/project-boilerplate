# coding: utf-8
'''The API.'''
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
#	pylint: disable=wrong-import-position
from .domain.users import AuthEndpoint, UserCollectionEndpoint, \
	UserInstanceEndpoint, PasswordResetEndpoint, LocalSessionCheckEndpoint
#	pylint: enable=wrong-import-position

#	Initialize system.
create_models()

#	Create WSGI application.
application = create_api({ # pylint: disable=invalid-name
	'/users': UserCollectionEndpoint(),
	'/users/{id:uuid}': UserInstanceEndpoint(),
	'/auth': AuthEndpoint(),
	'/auth/pass-reset': PasswordResetEndpoint(),
	'/--auth-check': LocalSessionCheckEndpoint()
})

#	Define debug helper.
def serve(port=None):
	'''A debugging service function.'''
	if not port:
		port = 7990
	serving.run_simple('0.0.0.0', port, application, use_reloader=True)

#	Ready to go!
log.info('API server %s initialized', __version__)
