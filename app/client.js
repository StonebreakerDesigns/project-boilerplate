/* The application client side. */
import { render, h } from 'preact';

import config from '../config/client.config';
import router from './router';
import history from './history';
import { StyleContext } from './styled';
import App from './app';

const root = document.getElementById('app-container');

const initialize = async () => {
	history.listen((location, action) => {
		if (action != 'PUSH' && action != 'POP') return;

		(async () => {
			const route = await router.resolve(location.pathname);
			document.title = route.title;
			render(
				<StyleContext.Provider value={ null }>
					<App><route.component/></App>
				</StyleContext.Provider>,
				root, root.firstElementChild
			);
		})();
	});

	//	Load initial page.
	const route = await router.resolve(window.location.pathname);
	document.title = route.title;
	render(
		<StyleContext.Provider value={ null }>
			<App><route.component/></App>
		</StyleContext.Provider>, 
		root, root.firstElementChild
	);
};

initialize();
