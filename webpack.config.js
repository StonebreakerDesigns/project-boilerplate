const path = require('path');
const merge = require('webpack-merge');

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
					{loader: 'style-loader'},
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
				test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
				use: [{
					loader: 'file-loader',
					options: {
						name: '[name].[ext]',
						outputPath: 'fonts/'
					}
				}]
			}
		]
	}
};


module.exports = [merge(common, {
	entry: ['babel-polyfill', './app/server.js'],
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'server.js'
	},
	target: 'node'
}), merge(common, {
	entry: ['babel-polyfill', './app/client.js'],
	output: {
		path: path.resolve(__dirname, './dist/client-bundles'),
		filename: 'client.js'
	}
})];
