export default new (class Router {
	constructor() {
		this.routing = {
			'/': () => import(
				/* webpackChunkName: 'homepage' */ './routes/homepage'
			)
		};
		
		this.fallback = () => import(
			/* webpackChunkName: 'not-found' */ './routes/not-found'
		);
	}

	async resolve(route) {
		if (route in this.routing) {
			const Component = (await this.routing[route]()).default;
			return {
				status: 200,
				title: Component.metadata.title,
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