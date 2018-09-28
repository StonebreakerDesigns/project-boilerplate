/* App build automation. */
const fs = require('fs');
const gulp = require('gulp');
const webpack = require('webpack-stream');
const webpackConfig = require('./webpack.config');

gulp.task('reset', () => {
	//	Setup.
	const setupDirs = ['./dist', './dist/client'];

	setupDirs.forEach(dirPath => {
		if (!fs.existsSync(dirPath)) {
			console.log(`Creating ${ dirPath }`);
			fs.mkdirSync(dirPath);
		}
		
		let items = fs.readdirSync(dirPath);
		items.forEach(path => {
			if (!path.endsWith('.js')) return;

			path = dirPath + '/' + path;
			console.log(`Cleaning ${ path }`);
			fs.unlinkSync(path);
		});
	});
});

gulp.task('server', () => {
	return gulp.src('./app/*.js')
		.pipe(webpack(webpackConfig[1]))
		.pipe(gulp.dest('./dist'));
});

gulp.task('client', () => {
	return gulp.src('./app/*.js')
		.pipe(webpack(webpackConfig[0]))
		.pipe(gulp.dest('./dist/client'));
});

gulp.task('default', ['reset', 'server', 'client']);
