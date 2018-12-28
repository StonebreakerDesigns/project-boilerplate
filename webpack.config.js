/** Webpack configuration. */
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

/** Generate the shared configuration segement. */
const shared = (name, ...entries) => ({
	name,
	entry: ['babel-polyfill', './app/' + name + '.js', ...entries],
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
					{loader: 'less-loader'}
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
				use: 'preact-svg-loader',
			},
			{
				test: /\.yaml$/,
				use: [
					{loader: 'json-loader'},
					{loader: 'yaml-loader'}
				]
			}
		]
	}
});

//	Export client and server builds.
module.exports = [merge(shared('client'), {
	output: {
		path: path.resolve(__dirname, './dist/client'),
		filename: 'client.js',
		publicPath: '/assets/'
	},
	devServer: {
		contentBase: 'dist',
		port: 7991
	}
}), merge(shared('server', 'webpack/hot/poll?1000'), {
	name: 'server',
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'server.js'
	},
	plugins: [
		// https://github.com/brianc/node-postgres/issues/838
		new webpack.IgnorePlugin(/^pg-native$/),
		new webpack.HotModuleReplacementPlugin({quiet: true})
	],
	target: 'node'
})];
