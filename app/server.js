/** The isomorphic application server. */
import path from 'path';
import express from 'express';
import proxy from 'express-http-proxy';
import { h } from 'preact';
import { render } from 'preact-render-to-string';

import config from '../config/server.config';
import router from './router';
import { StyleContext } from './style-context';
import App from './app';

/** An HTML document to be served containing the SSRd route. */
class HTMLDocument {
	constructor(options) {
		this.route = options.route;
		this.query = options.query;
		this.content = options.content;
		this.title = options.title;
	}

	/** Serialize this document as a string. */
	serialize() {
		//	Setup style collection.
		let styles = [];
		/** Adds a style to be SSRd. */
		const addStyle = s => {
			if (styles.indexOf(s) >= 0) return;

			styles.push(s);
		};
		
		//	Render.
		const Component = this.content;
		//	XXX: Customize the base document as needed.
		let rendered = render(<html>
			<head>
				<title>{ this.title }</title>
				<link rel="icon" type="image/png" href={ config.favicon }/>
				<meta 
					name="viewport" 
					content="width=device-width, initial-scale=1"
				/>
				<meta name="description" content={ config.defaultDescription }/>
				<link 
					rel="stylesheet" 
					href="/static/lib/fontawesome/import.css"
				/>
			</head>
			<body>
				<div id="app">
					<StyleContext.Provider value={ addStyle }>
						<App route={ this.route } query={ this.query }>
							<Component/>
						</App>
					</StyleContext.Provider>
				</div>
				<script src="/assets/client.js" defer/>
			</body>
		</html>);

		//	Insert styles.
		return rendered.replace(
			'</head>', 
			`<style>${ styles.map(s => s._getCss()).join('') }</style></head>`
		);
	}
}

//	Setup app.
const app = express();
app.use('/static', express.static(path.join(process.cwd(), 'static')));
app.use('/assets', express.static(path.join(process.cwd(), 'dist', 'client')));
// TODO: Next only in dev. mode.
app.use('/api', proxy(config.localAPIAccess));
app.get('*', async (req, resp) => {
	//	Resolve the route.
	let route = await router.resolve(req.path);
	//	Create the document.
	let document = new HTMLDocument({
		route: req.path,
		query: req.query,
		title: route.title,
		content: route.component
	});
	
	//	Respond.
	resp.writeHead(route.status, {
		'Content-Type': 'text/html; charset=utf-8'
	});
	resp.end(`<!DOCTYPE html>${ document.serialize() }`);
});

//	Process command line arguments.
const args = process.argv;
let port = args.length < 3 ? 80 : args[2];
app.listen(port);
