'''How big is this project?'''
import os

def measure():
	'''Print the size of the current repository by file type.'''
	tfiles = 0
	tlines = 0
	buckets = {
		'py': [0, 0],
		'js': [0, 0],
		'less': [0, 0],
		'html': [0, 0],
		'bat': [0, 0],
		'sh': [0, 0],
		'yaml': [0, 0],
		'json': [0, 0],
		'svg': [0, 0]
	}

	for dirn, u_trash, filens in os.walk('.'):
		if 'node_modules' in dirn:
			continue
		for filen in filens:
			ext = filen.split(r'.')[-1]
			if ext not in buckets or 'package-lock' in filen:
				continue

			buckets[ext][0] += 1
			tfiles += 1
			with open(os.path.join(dirn, filen), 'r') as file:
				lines = len(file.readlines())
				buckets[ext][1] += lines
				tlines += lines

	print('type\tfiles\tlines\t%')
	for ext, values in buckets.items():
		print('%s\t%d\t%d\t%d'%(
			ext, values[0], values[1], int((values[1]/tlines)*100)
		))

	print('\nTotal: %d files, %d lines'%(tfiles, tlines))

if __name__ == '__main__':
	measure()
