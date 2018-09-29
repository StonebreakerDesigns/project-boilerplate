/**
*	Authenticate-related higher order components. Do not rely on these for 
*	security!
*/
import { Component, h } from 'preact';

import history from './history';

/** 
*	A decorator for pages that only allows the page to be visited if a user is 
*	authenticated. Must be applied after the `contextual` decorator.
*/
const authenticate = TargetComponent => {
	//	eslint-disable-next-line react/display-name
	return class extends Component {
		componentWillMount() {
			const context = this.props.context;

			if (!context.user) {
				context.flashMessage('Please log in first');
				history.push('/login?r=' + context.route);
			}
		}

		render(props) { return (
			<TargetComponent {...props}/>
		); }
	};
};

/**
*	A decorator for pages that only allow anonymous visits. Must be applied
*	after the `contextual` decorator.
*/
const deauthenticate = TargetComponent => {
	//	eslint-disable-next-line react/display-name
	return class extends Component {
		componentWillMount() {
			const context = this.props.context;

			if (context.user) {
				//	eslint-disable-next-line quotes
				context.flashMessage("You can't do that while logged in");
				history.push('/dashboard');
			}
		}

		render(props) { return (
			<TargetComponent {...props}/>
		); }
	};
};

//	Exports.
export { authenticate, deauthenticate };
