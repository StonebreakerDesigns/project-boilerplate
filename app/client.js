import React from 'react';
import ReactDOM from 'react-dom';

import router from './router';
import history from './history';
import App from './app';

const root = document.getElementById('app-container');

const initialize = async () => {
	history.listen((location, action) => {
		if (action != 'PUSH' && action != 'POP') return;

		(async () => {
			const route = await router.resolve(location.pathname);
			document.title = route.title;
			ReactDOM.render(
				<App>
					<route.Component/>
				</App>,
				root
			);
		})();
	});

	//	Load initial page.
	const route = await router.resolve(window.location.pathname);
	ReactDOM.hydrate(
		<App>
			<route.Component/>
		</App>, 
		root
	);
};

initialize();