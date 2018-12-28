/** Isomorphic routing. */

/** The singleton router. */
class Router {
	constructor() {
		//	Declare routing.
		this.routing = {
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
			'/--not-found--': () => import(
				/* webpackChunkName: 'e-missing' */ './routes/errors/not-found'
			),
			'/--server-errror--': () => import(
				/* webpackChunkName: 'e-server' */ './routes/errors/server-error'
			)
		};
	}

	/** Resolve the given route. */
	async resolve(route) {
		//	Maybe fall back.
		let actualParts = route.split('/'), templated = {}, loader = null;
		for (let path in this.routing) {
			let checkParts = path.split('/'), i = 0, failed = false;

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
				//	Found.
				loader = this.routing[path];
				break;
			}
		}
		if (!loader) return { 
			...(await this.resolve('/--not-found--')), templated 
		};

		return { ...(await loader()).default, templated };
	}
}

//	Export a router.
export default new Router();