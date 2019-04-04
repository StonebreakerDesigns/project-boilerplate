/** The client-side application entry point. */
import { Component, render, h } from 'preact';

//	Polyfill preact.
import '../preact-polyfills';

import { NotFound, Unauthorized, Forbidden, SeeOther } from '../errors';
import resolveRoute, { FORBIDDEN, NOT_FOUND } from '../router';
import logger from '../log';
import history from '../history';
import contextual from '../app-context';
import { StyleContext } from '../style-context';
import { get } from '../requests';
import { App } from '../app';
import config from '../config';

//	Create a logger.
const log = logger('client');

/** The client application. */
class ClientDriver {
	constructor() {
		this.rootNode = document.getElementById('app-root');
		this.app = null;
		this.initialPage = true;
		this.unhaltPendingContextReliances = null;

		//	Setup history API hooks.
		history.listen(({pathname}) => this.loadPage(pathname));
		//	Load initial page.
		this.loadPage(window.location.pathname);

		//	Maybe attach debug access to window.
		if (config.development.debug) {
			window.client = this;
			window.navigate = route => history.push(route);
		}
	}

	/** Parse a query string into a map. */
	parseQuery(str) {
		let query = {},
			pairs = (str[0] === '?' ? str.substr(1) : str).split('&');
	
		for (let i = 0; i < pairs.length; i++) {
			let pair = pairs[i].split('=');
			query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
		}
		return query;
	};

	/** 
	*	The data provision mechanism for client-side runtime of page-level data
	*	reliant components. 
	*/
	async fetchData(route) {
		try { 
			let { data } = await get(route);
			return data;
		}
		catch (ex) {
			//	If a canonical error occurred handle it appropriately.
			if (ex.status == 404) throw new NotFound();
			if (ex.status == 401) throw new Unauthorized();
			if (ex.status == 403) throw new Forbidden();
	
			throw ex;
		}
	}

	/**
	*	Call a function with handling of application-canonical errors.
	*	Returns true if a error was caught and handled.
	*/
	async safeCall(route, func) {
		try {
			return await func();
		}
		catch (ex) {
			log.debug('safeCall caught: ', ex);
			if (ex instanceof NotFound) {
				this.loadPage(NOT_FOUND);
				return true;
			}
			if (ex instanceof Unauthorized) {
				history.push('/login?t=' + route);
				return true;
			}
			if (ex instanceof Forbidden) {
				this.loadPage(FORBIDDEN);
				return true;
			}
			if (ex instanceof SeeOther) {
				history.push(ex.dest);
				return true;
			}
			
			throw ex;
		}
	}

	/** Transform a component to add an HOC that manages it's data. */
	makeComponentFetchable(InnerComponent, dataProvider) {
		//	Alias canonical fetch implementation.
		let fetch = this.fetchData;

		//	eslint-disable-next-line react/display-name
		return contextual(class extends Component {
			constructor(props) {
				super(props);
	
				this.state = { data: props.data };
			}
	
			/** 
			*	Retrieve the data backing the child component using the provider.
			*/
			@bound
			async fetchChildData() {
				await this.props.context.nextReady();
				let { context: { templated } } = this.props,
					{ data } = await callProtectedFromCanonical(async () => (
						await dataProvider(templated, fetch)
					));
	
				this.setState({ data });	
			}
	
			render(props, { data }) { return data && (
				<InnerComponent {...{ 
					...props, ...data, fetchData: this.fetchChildData
				}}/>
			); }
		});
	}

	//	XXX: Refactor.
	/** Create and return the context-update deferral machinery. */
	createContextDeferral() {
		let q = [];
		return [
			() => q.forEach(f => f()),
			() => new Promise(resolve => q.push(resolve))
		];
	}

	/** Load the page at the given route. */
	async loadPage(route) {
		log.info('load route', route);

		//	Resolve the route.
		let user, { 
			data, dataProvider, authCheck, metadata, component, templated
		} = await resolveRoute(route);

		//	XXX: With data-backed pages on initial load, we need to properly 
		//		handle data access failures. Note this is an edge case because
		//		data-backing pages is done for SEO (=> open content).
		
		//	Maybe run auth check.
		if (authCheck) {
			if (await this.safeCall(route, async () => (
				authCheck(this.initialPage ? window.user : this.app.state.user)
			))) return;
		}
	
		//	Maybe run the data provider and/or auth check.
		if (this.initialPage) {
			this.initialPage = false;

			//	If this is the first load, we rely on server work for 
			//	authorization and initial data load.
			data = window.data;
			user = window.user;

			if (dataProvider) {
				component = this.makeComponentFetchable(component, dataProvider);
			}
		}
		else {
			//	We can't rely on the server anymore - the injected data isn't
			//	current.

			//	Maybe run data provider.
			if (dataProvider) {
				let provided = await this.safeCall(route, async () => (
					await dataProvider(templated, fetch)
				));
				if (provided === true) return;
	
				//	Use provided.
				if (provided.data) data = provided.data;
				if (provided.metadata) metdata = provided.metadata;

				//	Setup refresh callback.
				component = this.makeComponentFetchable(component, dataProvider);
			}
		}
		//	Set safety defaults.
		data = data || {};
	
		//	Edit document.
		if (metadata && metadata.title) window.document.title = metadata.title;

		//	Set up a mechanism by which top-level components can wait until the
		//	context is updated to run their onmount work.
		let [unhaltContextReliances, nextContextReady] = this.createContextDeferral();

		//	Render.
		let PageComponent = component, appProps = { 
			route, query: this.parseQuery(window.location.search), user,
			templated, nextReady: nextContextReady
		};
		render(
			<StyleContext.Provider value={ null }>
				<App binding={ a => this.app = a } {...appProps}>
					<PageComponent data={ data }/>
				</App>
			</StyleContext.Provider>,
			this.rootNode, this.rootNode.firstElementChild
		);

		//	We unhalt components waiting on a new context off-by-one since they halt
		//	using the then-current context.
		if (this.unhaltPendingContextReliances) {
			this.unhaltPendingContextReliances();
		}
		this.unhaltPendingContextReliances = unhaltContextReliances;
	};
};

//	Initialize.
new ClientDriver();
