/* The application server. */
import path from 'path';
import express from 'express';
import proxy from 'express-http-proxy';
import { h } from 'preact';
import { render } from 'preact-render-to-string';
import bound from 'autobind-decorator';

import config from '../config/server.config';
import router from './router';
import { StyleContext } from './styled';
import App from './app';

class HTMLDocument {
	/* An HTML document. */

	constructor(options) {
		this.content = options.content;
		this.title = options.title;

		this.styles = [];
	}

	@bound
	addStyle(style) {
		this.styles.push(style);
	}

	serialize() {
		const Component = this.content;
		//	XXX: Customize the base document as needed.
		let rendered = render(<html>
			<head>
				<title>{ this.title }</title>
				<link rel="icon" type="image/png" href={ config.favicon }/>
				<meta name="viewport" content="width=device-width, initial-scale=1"/>
				<meta name="description" content={ config.defaultDescription }/>
			</head>
			<body>
				<div id="app-container">
					<StyleContext.Provider value={ this.addStyle }>
						<App><Component/></App>
					</StyleContext.Provider>
				</div>
				<script src="/assets/client.js" defer/>
			</body>
		</html>);

		let initialStyles = this.styles.map(s => s._getCss()).join('');
		rendered = rendered.replace(
			'</head>', 
			`<style>${ initialStyles }</style></head>`
		);

		return rendered;
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
		content: route.component
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
