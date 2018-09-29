/** The client-side application entry point. */
import { render, h } from 'preact';

import router from './router';
import history from './history';
import { StyleContext } from './styled';
import App from './app';

//	Grab root.
const root = document.getElementById('app');
/** The application initializer. */
const initialize = async () => {
	/** Load the page at the specified route. */
	const loadPage = async route => {
		const routeObj = await router.resolve(route);
		document.title = routeObj.title;
		render(
			<StyleContext.Provider value={ null }>
				<App><routeObj.component/></App>
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
