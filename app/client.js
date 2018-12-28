/** The client-side application entry point. */
import { Component, render, h } from 'preact';
import bound from 'autobind-decorator';

import { NotFound, Unauthorized, Forbidden } from './errors';
import router from './router';
import history from './history';
import sleep from './sleep';
import contextual from './bind-context';
import { get } from './requests';
import { StyleContext } from './bind-style';
import App from './app';

//	Grab root.
const root = document.getElementById('document-root');
//	Create an app holder.
let app;

/** Parses a query string, returning a key, value map. */
const parseQuery = str => {
	let query = {},
		pairs = (str[0] === '?' ? str.substr(1) : str).split('&');

	for (let i = 0; i < pairs.length; i++) {
		let pair = pairs[i].split('=');
		query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
	}
	return query;
};

/** Provider fetch implementation. */
const fetch = async route => {
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
};

/** Call `fn` with canonical error handling. */
const callProtectedFromCanonical = async func => {
	try {
		return await func();
	}
	catch (ex) {
		if (ex instanceof NotFound) {
			loadPage('/--not-found--');
			return;
		}
		if (ex instanceof Unauthorized) {
			history.push('/login');
			return;
		}
		if (ex instanceof Forbidden) {
			loadPage('/--forbidden--');
			return;
		}
		
		throw ex;
	}
};

/** Load the page at the specified route. */
const loadPage = async (route, initial=false) => {
	//	Resolve the route.
	let { title, data, provider, authority, component, templated } = await router.resolve(route);

	//	Maybe run the provider.
	if (!initial) {
		if (authority) {
			await callProtectedFromCanonical(async () => (
				authority(app.state.user)
			));
		}
		if (provider) {
			let provided = await callProtectedFromCanonical(async () => (
				await provider(templated, fetch)
			));

			//	Use provided.
			title = provided.title || title;
			data = provided.data || data;
			//	Setup refresh callback.
			component = makeComponentFetchable(component, provider);
		}
	}
	//	Set defaults.
	data = data || {};

	//	Edit document.
	document.title = title;
	//	Render.
	const Component = component,
		rootProps = { route, templated, query: parseQuery(window.location.search) };
	render(
		<StyleContext.Provider value={ null }>
			<App binding={ a => app = a } {...rootProps}>
				{ /** XXX: Yikes this namespace. */}
				<Component {...data} {...rootProps}/>
			</App>
		</StyleContext.Provider>,
		root, root.firstElementChild
	);
};

/** 
*	Wrap an HOC onto the given component so that it can refresh from its provider.
*/
const makeComponentFetchable = (InnerComponent, provider) => (
	//	eslint-disable-next-line react/display-name
	contextual(class extends Component {
		constructor(props) {
			super(props);

			this.state = { data: props.data };
		}

		/** 
		*	Retrieve the data backing the child component using the provider.
		*/
		@bound
		async fetchChildData() {
			await sleep(100); // TODO: This ensures context is current...
			let { context: { templated } } = this.props,
				{ data } = await callProtectedFromCanonical(async () => (
					await provider(templated, fetch)
				));

			this.setState({ data });	
		}

		render(props, { data }) { return data && (
			<InnerComponent {...{ 
				...props, ...data, fetchData: this.fetchChildData
			}}/>
		); }
	})
);

//	Initialize.
(async () => {
	//	Setup history API hooks.
	history.listen((location, action) => {
		if (action != 'PUSH' && action != 'POP') return;

		loadPage(location.pathname);
	});

	//	Load initial page.
	loadPage(window.location.pathname, true);
})();
