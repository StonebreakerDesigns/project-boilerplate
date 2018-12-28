/** The application server. */
/* eslint-disable no-console */
import path from 'path';
import express from 'express';
import proxy from 'express-http-proxy';
import request from 'request';
import { h } from 'preact';
import { render } from 'preact-render-to-string';

import config from '../config/server.config.json';
import { NotFound, SeeOther, Forbidden } from './errors';
import router from './router';
import { StyleContext } from './bind-style';
import App from './app';

//	Define the metadata schema to value key map.
const METADATA_VALUE_KEYS = {
	twitter: 'content',
	og: 'property'
};

//	Attach hooks.
process.on('unhandledRejection', err => {
	console.log(err.stack);
});

/** An SSR'd document. */
class HTMLDocument {
	constructor(essc) { this.essc = essc; }

	/** Return a metadata tag. */
	renderMetadata(ns, key, value) { return (
		<meta key={ ns + key } name={ ns + ':' + key } {...{[METADATA_VALUE_KEYS[ns]]: value}}/>
	); }

	/** Render this document as a string. */
	render() {
		//	Setup style collection.
		let styles = [];
		/** Adds a style to be SSRd. */
		const addStyle = s => {
			if (styles.indexOf(s) >= 0) return;

			styles.push(s);
		};
		
		//	Unpack and process essence.
		const { 
			route, query, templated, title, component, description, data, metadata 
		} = this.essc;
		const PageComponent = component, rootProps = { route, query, templated };
		
		//	Setup metadata tags.
		let metadataTags = [], common = metadata.common || {};
		Object.keys(metadata || {}).forEach(ns => {
			if (ns == 'common') return;

			let nsMap = {...common, ...metadata[ns]};
			Object.keys(nsMap).forEach(key => {
				metadataTags.push(this.renderMetadata(ns, key, nsMap[key]));
			});
		});

		//	Rendered.
		const rendered = render(<html lang="en">
			<head>
				<title>{ title }</title>
				<link rel="icon" type="image/png" href="/static/site-icon.png"/>
				<meta name="viewport" content="width=device-width, initial-scale=1"/>
				<meta name="description" content={ description }/>
				{ metadataTags }
				<script id="-data-preload" dangerouslySetInnerHTML={{_html: 
					'window.data = ' + JSON.stringify(data) + ';'
				}}/>
			</head>
			<body>
				<div id="document-root">
					<StyleContext.Provider value={ addStyle }>
						<App {...rootProps}>
							<PageComponent {...rootProps}/>
						</App>
					</StyleContext.Provider>
				</div>
				<script id="-app-load" src="/assets/client.js" defer/>
			</body>
		</html>);

		//	Insert styles.
		const renderedStyles = styles.map(s => s._getCss()).join('');
		return rendered.replace('</head>', 
			'<style id="-ssr-styles">' + renderedStyles + '</style></head>'
		);
	}
}

/** Retrieve the auth. level of the given request from the API. */
const getAuthLevel = req => new Promise((resolve, reject) => {
	request(config.env.apiAccess + '/api/--auth-check', {
		json: true, headers: {'Cookie': req.header('Cookie')}
	}, (err, resp, body) => {
		if (err) { reject(err); return; }

		resolve(body.data);
	});
});

/** Return a provider fetch implementation. */
const createFetch = req => route => new Promise((resolve, reject) => {
	request({
		url: config.env.apiAccess + route,
		headers: {
			'Cookie': req.header('Cookie')
		}
	}, (err, resp, body) => {
		if (err) { reject(err); return; }
		
		if (resp.statusCode == 404) throw new NotFound();
		if (resp.statusCode == 401) throw new SeeOther('/login');
		if (resp.statusCode == 403) throw new Forbidden();

		resolve(body.data);
	});
});

/** Serve a document. */
const serveDocument = async (route, req, resp) => {
	//	Resolve the route.
	let { 
		status, title, description, data, metadata, provider, component, templated, authority
	} = await router.resolve(route);
	
	try { 
		//	Maybe run the auth. check.
		if (authority) authority(await getAuthLevel(req));

		//	Maybe run the provider.
		if (provider) {
			let provided = await provider(templated, createFetch(req));

			//	Use provided.
			title = provided.title || title;
			description = provided.description || description;
			data = provided.data || data;
			metadata = provided.metadata || metadata;
		}
	}
	catch (ex) {
		//	If there was a canonical error, handle appropriately.
		if (ex instanceof NotFound) {
			await serveDocument('/--not-found--', req, resp);
			return;
		}
		if (ex instanceof SeeOther) {
			resp.status(303).set({
				'Content-Type': 'text/plain',
				'Location': ex.dest
			}).send('See ' + ex.dest);
			return;
		}
		if (ex instanceof Forbidden) {
			await serveDocument('/--forbidden--', req, resp);
			return;
		}

		throw ex;
	}
	//	Apply defaults.
	status = status || 200;
	metadata = metadata || {};

	//	Create the document.
	const html = (new HTMLDocument({
		route, query: req.query, status, title, description, data, metadata, component, templated
	})).render();
	
	//	Respond.
	resp.status(status).set({
		'Content-Type': 'text/html; charset=utf-8'
	}).send('<!DOCTYPE html>' + html);
};

/** Create and return an application. */
const setupApp = () => {
	//	Create.
	const app = express();

	//	Use static dir.
	app.use('/static', express.static(path.join(process.cwd(), 'static')));
	//	Maybe setup dev. proxies.
	if (config.development.debug) {
		//	Proxy to webpack asset server.
		app.use('/assets', proxy(config.development.assetAccess, {
			proxyReqPathResolver: req => '/assets' + req.url
		}));
		//	Proxy to API.
		app.use('/api', proxy(config.env.apiAccess, {
			proxyReqPathResolver: req => '/api' + req.url
		}));
	}

	app.get('*', async (req, resp) => {
		try {
			await serveDocument(req.path, req, resp);
		}
		catch (ex) {
			console.error(ex.stack);
			try {
				await serveDocument('/--server-error--', req, resp);
			}
			catch (anotherEx) {
				console.error('Double wammy!');
				console.error(anotherEx.stack);
				resp.status(500).set({
					'Content-Type': 'text/plain'
				}).send('An error occurred');
			}
		}
	});

	return app;
};

//	Process command line arguments.
const args = process.argv;
let port = args.length < 3 ? 80 : args[2];

//	Create app.
let app = setupApp(), server;
//	Maybe setup HMR.
if (config.development.debug && module.hot) {
	module.hot.accept(['./app', './router'], () => {
		server.close();
		app = setupApp();
		server = app.listen(port, () => console.log('Server restarted'));
	});
}
server = app.listen(port, () => console.log('Server started'));
