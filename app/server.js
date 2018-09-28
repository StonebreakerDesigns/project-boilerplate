/* The application server. */
import path from 'path';
import express from 'express';
import proxy from 'express-http-proxy';
import { render } from 'preact-render-to-string';
import { h } from 'preact';

import config from '../config.server';
import router from './router';
import App from './app';

class HTMLDocument {
	/* An HTML document. */

	constructor(options) {
		this.content = options.content;
		this.title = options.title;
	}

	serialize() {
		//	XXX: Customize the base document as needed.
		return render(<html>
			<head>
				<title>{ this.title }</title>
				<link rel="icon" type="image/png" href={ 
					config.theme.favicon 
				}/>
			</head>
			<body>
				<div id="app">{ this.content }</div>
				<script src="/assets/client.js"/>
			</body>
		</html>);
	}
}

//	Setup app.
const app = express();

app.use('/static', express.static(path.join(process.cwd(), 'static')));
app.use('/assets', express.static(path.join(process.cwd(), 'dist', 'client')));
app.use('/api', proxy('http://localhost:7990')); // TODO: Only in dev. mode.
app.get('*', async (req, resp) => {
	let route = await router.resolve(req.path);
	let document = new HTMLDocument({
		title: route.title,
		content: <App><route.Component/></App>
	});
	
	resp.writeHead(route.status, {
		'Content-Type': 'text/html; charset=utf-8'
	});
	resp.end(`<!DOCTYPE html>${ document.serialize() }`);
});

//	Process command line arguments.
const args = process.argv;
let port = args.length < 3 ? 80 : args[2];
app.listen(port);
