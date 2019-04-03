/** Webpack configuration. */
const path = require('path');
const process = require('process');
const webpack = require('webpack');
const merge = require('webpack-merge');
const { spawn } = require('child_process');

//	Constants.
const FS_POLL = 'webpack/hot/poll?1000';
//	Whether we are in development server mode.
const WILL_LAUNCH = process.env.DEV_LAUNCH == '1';

if (WILL_LAUNCH) {
	console.log('---- App server will start after build ----');
}

/** The server launch plugin. */
class DevEnvLaunchPlugin {
	constructor() {
		this.serverProc = null;
	}

	launch() {
		if (!WILL_LAUNCH) return;

		if (this.serverProc) {
			//	Kill.
			this.serverProc.stdin.pause();
			this.serverProc.kill();
		}

		console.log('---- Spawning application server ----');

		this.serverProc = spawn('node', ['./dist/server.js']);
		this.serverProc.stdout.on('data', data => {
			//	eslint-disable-next-line no-console
			console.log(data.toString().trim());
		});
		this.serverProc.stderr.on('data', data => {
			//	eslint-disable-next-line no-console
			console.warn(data.toString().trim());
		});
		this.serverProc.on('exit', code => {
			//	eslint-disable-next-line no-console
			console.log('Server exited: ' + code);
		});	
	}
	
	apply(compiler) {
		console.log('\t -> Applying tap');
		compiler.hooks.done.tap('DevEnvLaunchPlugin', this.launch.bind(this));
	}
}

/** Generate the base configuration segement. */
const createBase = (name, getEntries) => ({
	name,
	entry: [
		'babel-polyfill', './app/' + name + '/index.js', ...getEntries()
	],
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
				test: /\.(?:eot|woff|woff2|ttf)$/,
				use: {
					loader: 'file-loader',
					options: {publicPath: '/assets'}
				}
			}
		]
	}
});

//	Export client and server builds.
module.exports = [merge(createBase('client', () => []), {
	output: {
		path: path.resolve(__dirname, './dist/client'),
		filename: 'client.js',
		publicPath: '/assets/'
	},
	devServer: {
		contentBase: 'dist',
		port: 7991
	}
}), merge(createBase('server', () => WILL_LAUNCH ? [FS_POLL] : []), {
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'server.js'
	},
	plugins: [
		// https://github.com/brianc/node-postgres/issues/838
		new webpack.IgnorePlugin(/^pg-native$/),
		new webpack.HotModuleReplacementPlugin({quiet: true}),
		new DevEnvLaunchPlugin()
	],
	target: 'node'
})];
