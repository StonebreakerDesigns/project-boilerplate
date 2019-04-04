/** The application server. */
/* eslint-disable no-console */
import path from 'path';
import express from 'express';
import proxy from 'express-http-proxy';
import request from 'request';

//	Polyfill preact.
import '../preact-polyfills';

import config from './server-config';
import logger from '../log';
import { NotFound, SeeOther, Forbidden, Unauthorized } from '../errors';
import resolveRoute, { NOT_FOUND, FORBIDDEN, SERVER_ERROR } from '../router';
import { HTMLDocument } from './document';

//	Define constants.
const HANDLED_WITH_DOCUMENT = 'handle-with-doc';

//	Create a logger.
const log = logger('server');

//	Attach hooks.
//	XXX: Insufficient! App will lock on error, at worst we need 
//		to send it down.
process.on('unhandledRejection', err => {
	console.log(err.stack);
});

/** The server application with middleware on the middlewareHandler method. */
class ServerMiddlware {
	constructor() {
		this.middlewareHandler = this.middlewareHandler.bind(this);
	}

	/** 
	*	Retrieve the authenticated user for the given request from the 
	*	API.
	*
	*	XXX: Process could be improved by sharing token validation logic
	*		and database access more directly. 
	*/
	getAuthFor(req) {
		return new Promise((resolve, reject) => {
			//	Proxy the cookies to the API to retrieve auth. status.
			request(config.env.apiAccess + config.env.userAccessRoute, {
				json: true, headers: {'Cookie': req.header('Cookie')}
			}, (err, resp, body) => {
				if (err) { reject(err); return; }
		
				let { status, data, vid } = body;
				log.info('proxy auth status: ' + status);
				
				let user = status == 'success' ? data : null,
					setCookie = resp.headers['set-cookie'];

				resolve({ user, setCookie, vid });
			});
		});
	}

	/** 
	*	The data provision mechanism for server-side runtime of page-level data
	*	reliant components. 
	*/
	fetchData(req, route) {
		return new Promise((resolve, reject) => {
			request({
				url: config.env.apiAccess + route,
				headers: {'Cookie': req.header('Cookie')}
			}, (err, resp, body) => {
				if (err) { reject(err); return; }
				
				let { statusCode } = resp;
				log.info('dataFetch -> status', statusCode);
				if (statusCode == 404) throw new NotFound();
				if (statusCode == 401) throw new SeeOther('/login');
				if (statusCode == 403) throw new Forbidden();
				
				let { data } = body;
				log.debug('dataFetch -> data', data);
				resolve(data);
			});
		});
	}


	/** Call a function with handling of application-canonical errors. */
	async safeCall(req, resp, func) {
		try {
			return await func();
		}
		catch (ex) {
			if (ex instanceof NotFound) {
				await this.serveDocument(NOT_FOUND, req, resp);
				return HANDLED_WITH_DOCUMENT;
			}
			if (ex instanceof Unauthorized) {
				resp.status(303).set({
					'Content-Type': 'text/plain',
					'Location': '/login?t=' + req.path
				}).send('Please log in first');
				return HANDLED_WITH_DOCUMENT;
			}
			if (ex instanceof SeeOther) {
				resp.status(303).set({
					'Content-Type': 'text/plain',
					'Location': ex.dest
				}).send('See ' + ex.dest);
				return HANDLED_WITH_DOCUMENT;
			}
			if (ex instanceof Forbidden) {
				await this.serveDocument(FORBIDDEN, req, resp);
				return HANDLED_WITH_DOCUMENT;
			}

			throw ex;
		}
	}
	
	/** Serve the document associated with the given request. */
	async serveDocument(route, req, resp) {
		//	Resolve the route.
		let { 
			status, data, metadata, component, templated, 
			dataProvider, authCheck
		} = await resolveRoute(route);
		log.debug('serveDocument @', route, '-> status', status || 200);
		
		//	Retrieve current user.
		let { user, setCookie, vid } = await this.getAuthFor(req);
		//	Maybe run the auth. check.
		if (authCheck) {
			//	XXX: Unnessesary await/async is required?
			let result = await this.safeCall(req, resp, async () => {
				authCheck(user);
			});
			//	Maybe abort handling if safeCall already did.
			if (result == HANDLED_WITH_DOCUMENT) return;
		}

		//	Maybe run data provider.
		if (dataProvider) {
			//	Execute it.
			const fetch = async targetRoute => await this.fetchData(req, targetRoute);
			let provided = await this.safeCall(req, resp, async () => (
				await dataProvider(templated, fetch)
			));
			//	Maybe abort handling if safeCall already did.
			if (provided == HANDLED_WITH_DOCUMENT) return;

			//	Update from provider result.
			if (provided.data) data = provided.data;
			if (provided.metadata) metadata = provided.metadata;
		}

		//	Apply defaults.
		status = status || 200;
		data = data || {};
		metadata = metadata || config.document.defaultMetadata;

		//	Create the document.
		let document = new HTMLDocument({
			route, query: req.query, templated, component, 
			data, metadata, user, vid
		});
		
		//	Respond.
		let headers = {'Content-Type': 'text/html; charset=utf-8'};
		if (setCookie) headers['Set-Cookie'] = setCookie;
		log.info(route, '->', status);
		resp.status(status).set(headers).send('<!DOCTYPE html>' + document.render());
	};

	/** The middleware handler. */
	async middlewareHandler(req, resp) {
		try {
			await this.serveDocument(req.path, req, resp);
		}
		catch (ex) {
			log.critical(ex.stack);
			try {
				await this.serveDocument(SERVER_ERROR, req, resp);
			}
			catch (nextEx) {
				log.critical('Double wammy!');
				log.critical(nextEx.stack);
				resp.status(500).set({
					'Content-Type': 'text/plain'
				}).send('An error occurred');
			}
		}
	}
}

/** Create and return an express application. */
const createApplication = () => {
	//	Create express.
	let app = express();

	//	Use static dir.
	app.use('/static', express.static(path.join(process.cwd(), 'static')));
	//	Maybe setup dev. proxies.
	if (config.development.debug) {
		//	Proxy to webpack asset server.
		app.use('/assets', proxy(config.devEnv.assetAccess, {
			proxyReqPathResolver: req => '/assets' + req.url
		}));
		//	Proxy to API.
		app.use('/api', proxy(config.env.apiAccess, {
			proxyReqPathResolver: req => '/api' + req.url
		}));
	}

	//	Attach app server.
	app.get('*', (new ServerMiddlware()).middlewareHandler);

	return app;
};

/** Initialize the application. */
const initialize = (args) => {
	//	Process command line arguments and create application.
	let port = args.length < 3 ? 80 : args[2],
		app = createApplication(), server;
	
	//	Maybe setup HMR.
	if (config.development.debug && module.hot) {
		module.hot.accept(['../app', '../router'], () => {
			server.close();
			app = createApplication();
			server = app.listen(port, log.info.curry('restarted'));
		});
	}
	server = app.listen(port, log.info.curry('started'));
}

//	Initialize.
initialize(process.argv);