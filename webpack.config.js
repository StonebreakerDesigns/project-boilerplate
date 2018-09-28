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
		contentBase: './static',
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
