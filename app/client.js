/** The client-side application entry point. */
import { render, h } from 'preact';

import router from './router';
import history from './history';
import { StyleContext } from './style-context';
import App from './app';

//	Grab root.
const root = document.getElementById('app');
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
/** The application initializer. */
const initialize = async () => {
	/** Load the page at the specified route. */
	const loadPage = async route => {
		const routeObj = await router.resolve(route);
		document.title = routeObj.title;
		render(
			<StyleContext.Provider value={ null }>
				<App 
					route={ route } 
					query={ parseQuery(window.location.search) }
				>
					<routeObj.component/>
				</App>
			</StyleContext.Provider>,
			root, root.firstElementChild
		);
	};

	//	Setup history API hooks.
	history.listen((location, action) => {
		if (action != 'PUSH' && action != 'POP') return;

		loadPage(location.pathname);
	});

	//	Load initial page.
	loadPage(window.location.pathname);
};

//	Initialize.
initialize();
