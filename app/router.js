/* The routing manager. */
import NotFound from './components/not-found';

export default new (class Router {
	constructor() {
		this.routing = {
			'/': () => import(
				/* webpackChunkName: 'homepage' */ './routes/homepage'
			)
			//	XXX: Any additional routes.
		};
	}

	async resolve(route) {
		/* Return a promise that the route will be resolved. */
		if (route in this.routing) {
			const { component, title } = (await this.routing[route]()).default;
			return {
				status: 200,
				title: title,
				component: component
			};
		}

		return {
			status: 404,
			title: 'Not Found',
			component: NotFound
		}
	}
});