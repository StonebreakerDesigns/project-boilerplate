import path from 'path';
import express from 'express';
import React from 'react';
import ReactDOM from 'react-dom/server';

import router from './router';
import App from './app';

class HTMLDocument {
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
				<div id="app-container">${ ReactDOM.renderToString(this.content) }</div>
				<script src="/client.js"></script>
			</body>
		</html>
		`
	}
}

const app = express();

app.use(express.static(path.join(process.cwd(), 'dist', 'client-bundles')));
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

app.listen(7500);
