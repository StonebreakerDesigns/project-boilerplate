const path = require('path');
const merge = require('webpack-merge');

//	Common configuration.
const common = {
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.js?$/,
				use: 'babel-loader'
			},
			{
				test: /\.less?$/,
				use: [
					{loader: 'isomorphic-style-loader'},
					{loader: 'css-loader'},
					{
						loader: 'less-loader',
						options: {
							paths: [path.resolve(
								__dirname, 'node_modules/@fortawesome'
							)]
						}
					}
				]
			},
			{
				test: /\.css?$/,
				use: [
					{loader: 'style-loader'},
					{loader: 'css-loader'}
				]
			},
			{
				test: /\.svg$/,
				use: [
					{loader: 'preact-svg-loader'}
				],
			}
		]
	}
};

//	Export client and server builds.
module.exports = [merge(common, {
	entry: ['babel-polyfill', './app/client.js'],
	name: 'client',
	output: {
		path: path.resolve(__dirname, './dist/client'),
		filename: 'client.js',
		publicPath: '/assets/'
	},
	devServer: {
		contentBase: 'dist',
		proxy: {
			'/api': 'http://localhost:7990'
		}
	}
}), merge(common, {
	entry: ['babel-polyfill', './app/server.js'],
	name: 'server',
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'server.js'
	},
	target: 'node'
})];
