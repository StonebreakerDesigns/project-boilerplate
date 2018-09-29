# coding: utf-8
'''Centralized configuration provision via the `config` object.'''
import os
import yaml

from . import __path__ as root_path

#	Exceptions.
class ConfigKeyError(KeyError):
	'''A missing-key error specific to the configuration object.'''

#	Classes.
class Config:
	'''The class of the supplied configuration object.'''

	def __init__(self, data):
		self.__data = data

	def _wrap_value(self, value):
		'''Propagate this object's class onto an object.'''
		if isinstance(value, dict):
			return Config(value)
		elif isinstance(value, (list, tuple)):
			return list(self._wrap_value(sv) for sv in value)

		return value

	def __getattr__(self, attr):
		if attr == '__data':
			return self.__data
		if attr not in self.__data:
			raise ConfigKeyError(attr)

		return self._wrap_value(self.__data[attr])

	def __contains__(self, attr):
		return attr in self.__data

#	Initialization.
def load_configuration():
	'''Load the configuration found in `settings.json` into a friendly
	object.'''
	config_path = os.path.join(
		os.path.abspath(root_path[0]), 
		'../config/api.config.yaml'
	)
	with open(config_path, 'r') as config_file:
		preloaded_config = yaml.load(config_file)

	return Config(preloaded_config)

#	Load and provide the configuration.
config = load_configuration() #	pylint: disable=invalid-name
