/* Routing. */
export default new (class Router {
	constructor() {
		this.routing = {
			'/': () => import(
				/* webpackChunkName: 'homepage' */ './routes/homepage'
			)
			//	XXX: Any additional routes.
		};
		
		this.fallback = () => import(
			/* webpackChunkName: 'not-found' */ './routes/not-found'
		);
	}

	async resolve(route) {
		/* Return a promise that the route will be resolved. */
		if (route in this.routing) {
			const Component = (await this.routing[route]()).default;
			return {
				status: 200,
				title: 'TODO',
				Component: Component
			};
		}

		return {
			status: 404,
			title: 'Not Found',
			Component: (await this.fallback()).default
		}
	}
});