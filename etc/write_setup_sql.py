# coding: utf-8
'''A helper script that outputs SQL to initialize the database.'''
import yaml

def write_setup_sql():
	'''Return the SQL.'''
	with open('./config.api.yaml') as config_file:
		config = yaml.load(config_file)['database']

	return '\n'.join((
		'CREATE DATABASE %s;'%config['database'],
		'CREATE USER %s;'%config['user'],
		"ALTER USER %s WITH PASSWORD '%s';"%(
			config['user'], config['password']
		),
		'GRANT ALL ON DATABASE %s TO %s;'%(
			config['database'], config['user']
		)
	))

if __name__ == '__main__':
	print(write_setup_sql())
