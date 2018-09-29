/**
*	The isomorphic application root. Provides the application context. Any 
*	components that want to the contribute to the application context must be 
*	integrated with this component.
*/
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import { get } from './request';
import styled from './style-context';
import { AppContext } from './app-context'; 
import FlashMessages from './components/flash-messages';
import Header from './components/header';
import style from './app.less';

/**
*	The root application component. 
*/
@styled(style)
class App extends Component {
	constructor(props) {
		super(props);

		//	Define state.
		this.state = {
			route: this.props.route,
			user: null
		};
	}

	componentWillMount() {
		this.fetchAuth();		
	}

	/** Fetch the currently authenticated user. */
	@bound
	async fetchAuth() {
		let authFetch = await get('/auth');
		
		let user = authFetch.status == 'success' ? authFetch.data : null;
		this.setState({ user });
	}

	/**
	*	Flash a message. Should be accessed through the app context.
	*/
	@bound
	flashMessage(message) {
		this.flashMessages.add(message);
	}

	/**
	*	Reveal the header. Should be accessed through the app context.
	*/
	@bound
	showHeader() {
		this.header.setVisible(true);
	}

	/**
	*	Hide the header. Should be accessed through the app context.
	*/
	@bound
	hideHeader() {
		this.header.setVisible(false);
	}

	render({ children }, { route, user }) { 
		//	Collect app context.
		const appContext = {
			route: route,
			user: user,
			fetchAuth: this.fetchAuth,
			flashMessage: this.flashMessage,
			showHeader: this.showHeader,
			hideHeader: this.hideHeader
		};

		return (
			<div id="app-root">
				<AppContext.Provider value={ appContext }>
					<Header appBinding={ c => this.header = c }/>
					{ children }
					<FlashMessages appBinding={ c => this.flashMessages = c }/>
				</AppContext.Provider>
			</div>
		); 
	}
}

//	Exports.
export default App;
