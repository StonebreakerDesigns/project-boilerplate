/** 
*	Isomorphic routing. This module exports a single function responsible for 
*	transforming a route (a.k.a. path string) into the route definition 
*	exported by the corresponding module. It additionally provides a map 
*	containing the de-templated route parameters.
*/

//	Define psuedo-routes.
const NOT_FOUND = '/-/-not-found';
const SERVER_ERROR = '/-/-server-error';
const FORBIDDEN = '/-/-forbidden';

//	Define the application routing.
const ROUTING = {
	'/': () => import(
		/* webpackChunkName: 'homepage' */ './routes/landing'
	),
	'/signup': () => import(
		/* webpackChunkName: 'signup' */ './routes/signup'
	),
	'/login': () => import(
		/* webpackChunkName: 'login' */ './routes/login'
	),
	'/reset-password/{token}': () => import(
		/* webpackChunkName: 'reset-password' */  './routes/reset-password'
	),
	//	Special routes.
	[NOT_FOUND]: () => import(
		/* webpackChunkName: 'e-missing' */ './routes/errors/not-found'
	),
	[SERVER_ERROR]: () => import(
		/* webpackChunkName: 'e-server' */ './routes/errors/server-error'
	),
	[FORBIDDEN]: () => import (
		/* webpackChunkName: 'e-auth' */ './routes/errors/forbidden'
	)
};

/** The exposed functionality; resolves a route. */
const resolveRoute = async route => {
	//	Maybe fall back.
	let actualParts = route.split('/'), templated = {}, loader = null;

	//	XXX: Could this be O(log n) some day?
	for (let path in ROUTING) {
		let checkParts = path.split('/'), i = 0, failed = false;

		//	Walk into the target route, checking for a match.
		for (; i < actualParts.length; i++) {
			let actualPart = actualParts[i], checkPart = checkParts[i];
			
			let varMatch = /^{([\w-]+)}$/.exec(checkPart);
			if (varMatch) {
				//	This is a template variable.
				templated[varMatch[1]] = actualPart;
			}
			else {
				//	This isn't a template variable.
				if (checkPart != actualPart) {
					failed = true;
					break;
				}
			}
		}

		if (!failed && i == checkParts.length) {
			//	We've reached the bottom of the target route without
			//	mis-matching; found.
			loader = ROUTING[path];
			break;
		}
	}
	//	We failed to discover a loader.
	if (!loader) return { 
		...(await resolveRoute(NOT_FOUND)), templated 
	};

	//	We have a loader - success.
	return { ...(await loader()).default, templated };
}

//	Export the routing mechanism and psuedo-routes.
export { NOT_FOUND, SERVER_ERROR, FORBIDDEN };
export default resolveRoute;
