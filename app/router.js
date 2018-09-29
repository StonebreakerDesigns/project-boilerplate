/** The isomorphic routing manager. */
import NotFound from './components/not-found';

/**
*	The router is responsible for asyncronously retrieving the components
*	required to render each page. This supports code splitting.
*/
class Router {
	constructor() {
		//	XXX: Declare routing.
		this.routing = {
			'/': () => import(
				/* webpackChunkName: 'homepage' */ './routes/homepage'
			),
			'/signup': () => import(
				/* webpackChunkName: 'signup' */ './routes/signup'
			),
			'/login': () => import(
				/* webpackChunkName: 'login' */ './routes/login'
			),
			'/dashboard': () => import(
				/* webpackChunkName: 'dashboard' */ './routes/dashboard'
			),
			'/reset-password': () => import(
				/* webpackChunkName: 'reset-password' */ 
				'./routes/reset-password'
			)
		};
	}

	/** 
	*	Return a promise that the route will be resolved into an object
	*	containing the status code, document title, and root component of
	*	the given route.
	*/
	async resolve(route) {
		if (route in this.routing) {
			const { component, title } = (await this.routing[route]()).default;
			return {
				status: 200,
				title, component
			};
		}

		return {
			status: 404,
			title: 'Not Found',
			component: NotFound
		};
	}
}

//	Export a router.
export default new Router();