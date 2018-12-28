# coding: utf-8
'''Centralized logger factory.'''
import logging

from .config import config

#	The level options supported in configuration.
LEVEL_OPTIONS = list((
	'notset', 'debug', 'info', 'warning', 'error', 'critical'
))

def _setup_logger_supply():
	'''Create and return a logger generator.'''
	configured_level = config.development.log_level

	#	Perform basic configuration.
	logging.basicConfig(
		level=20, #	Configure 3rd party loggers to the INFO level.
		format='%(asctime)-10s %(name)-30s %(levelname)-8s %(message)s'
	)

	def create_log(name):
		'''Create a log and elevate it to the configured level.'''
		log = logging.getLogger(name)
		log.setLevel(LEVEL_OPTIONS.index(configured_level)*10)
		return log

	return create_log

#	Define the callable that can be used to create properly configured loggers.
logger = _setup_logger_supply() # pylint: disable=invalid-name
