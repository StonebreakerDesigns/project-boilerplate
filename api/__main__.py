# coding: utf-8
'''The CLI entry point.'''
import sys
import argparse
sys.path.insert(0, '.')

from api import serve #	pylint: disable=wrong-import-position

#	Define command line arguments.
parser = argparse.ArgumentParser(
	description='A Stonebreaker project'
)
parser.add_argument(
	'port', 
	nargs='?', type=int, 
	help='The port to serve from'
)

#	pylint: disable=invalid-name
args = parser.parse_args(sys.argv[1:])
serve(port=args.port or None)
