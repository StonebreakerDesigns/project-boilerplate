/**
*	The isomorphic application root. Provides the application context. Any 
*	components that want to the contribute to the application context must be 
*	integrated with this component.
*/
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import config from './config';
import { get, delete_ } from './request';
import styled from './style-context';
import { AppContext } from './app-context'; 
import FlashMessages from './components/flash-messages';
import { Spinner } from './components/primitives';
import Header from './components/header';
import style from './app.less';

/**
*	The root application component. 
*/
@styled(style)
class App extends Component {
	constructor(props) {
		super(props);

		this.flashMessages = null;
		this.preloadMessageQueue = [];

		//	Define state.
		this.state = {
			route: this.props.route,
			query: this.props.query,
			user: null,
			authFetched: false
		};
	}

	/** Maybe update the route and query if they changed. */
	componentDidUpdate(prevProps) {
		let { route, query } = this.props;
		
		if (route == prevProps.route && query == prevProps.query) {
			return;
		}
		
		this.setState({
			route, query
		});
	}

	async componentWillMount() {
		await this.fetchAuth();	
	}

	/** Bind the flash messages component. */
	@bound
	bindFlashMessages(component) {
		this.flashMessages = component;

		this.preloadMessageQueue.forEach(this.flashMessage);
		this.preloadMessageQueue = null;
	}

	/** 
	* 	Fetch the currently authenticated user. Should be access through the 
	*	app context. 
	*/
	@bound
	async fetchAuth() {
		let authFetch = await get('/auth');

		let user = authFetch.status == 'success' ? authFetch.data : null;
		this.setState({ authFetched: true, user });
		return user;
	}

	/**
	*	Delete the current authentication session. Should be accessed through 
	*	the app context.
	*/
	@bound
	async deleteAuth() {
		let authClear = await delete_('/auth');

		this.setState({user: null});
	}

	/** Flash a message. Should be accessed through the app context. */
	@bound
	flashMessage(message) {
		if (!this.flashMessages) {
			this.preloadMessageQueue.push(message);
			return;
		}

		this.flashMessages.add(message);
	}
	/** Show the header. Should be accessed through the app context. */
	@bound
	showHeader() {
		this.header.setVisible(true);
	}
	/** Hide the header. Should be accessed through the app context. */
	@bound
	hideHeader() {
		this.header.setVisible(false);
	}

	render({ children }, { authFetched, route, query, user }) { 
		//	Collect app context.
		const appContext = {
			route: route,
			query: query,
			user: user,
			fetchAuth: this.fetchAuth,
			deleteAuth: this.deleteAuth,
			flashMessage: this.flashMessage,
			showHeader: this.showHeader,
			hideHeader: this.hideHeader
		};
		//	Maybe provide debug access.
		if (typeof window !== 'undefined' && config.debug) {
			window.context = appContext;
		}

		return (
			<div id="app-root">
				{ !authFetched ? <Spinner/> : 
					<AppContext.Provider value={ appContext }>
						<Header appBinding={ c => this.header = c }/>
						{ children }
						<FlashMessages appBinding={ this.bindFlashMessages }/>
					</AppContext.Provider>
				}
			</div>
		); 
	}
}

//	Exports.
export default App;
