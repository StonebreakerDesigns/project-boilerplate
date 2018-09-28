/* The application server. */
import path from 'path';
import express from 'express';
import proxy from 'express-http-proxy';
import { render } from 'preact-render-to-string';
import { h } from 'preact';

import router from './router';
import App from './app';

class HTMLDocument {
	/* An HTML document. */

	constructor(options) {
		this.content = options.content;
		this.title = options.title;
		this.data = {};
	}

	addData(key, value) {
		this.data[key] = value;
	}

	serialize() {
		return `<!DOCTYPE html>
		<html>
			<head>
				<title>${ this.title }</title>
				<script>
					window.data = ${ JSON.stringify(this.data) };
				</script>
			</head>
			<body>
				<div id="app">${ render(this.content) }</div>
				<script src="/client.js"></script>
			</body>
		</html>
		`
	}
}

//	Setup app.
const app = express();

app.use(express.static(path.join(process.cwd(), 'dist', 'client-bundles')));
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
	resp.end(document.serialize());
});

//	Process command line arguments.
const args = process.argv;
let port = args.length < 3 ? 80 : args[2];
app.listen(port);
