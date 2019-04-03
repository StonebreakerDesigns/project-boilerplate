/** The isomorphic application root component. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import styled from './style-context';
import { get, delete_ } from './requests';
import { AppContext } from './app-context'; 
import Header from './components/header';
import style from './app.less';

/** The root application component. */
@styled(style)
class App extends Component {
	constructor(props) {
		super(props);

		this.state = {user: props.user};
	}

	componentDidMount() {
		let { binding } = this.props;
		if (binding) binding(this);
	}

	/** Fetch the currently authenticated user. */
	@bound
	async fetchAuth() {
		let { status, data } = await get('/auth');

		let user = status == 'success' ? data : null;
		this.setState({ user });
		return user;
	}

	/** Delete the current authentication session. */
	@bound
	async deleteAuth() {
		await delete_('/auth');
		this.setState({user: null});
	}

	/** The context object. */
	get contextObject() {
		let { fetchAuth, deleteAuth } = this,
			{ route, query, nextReady } = this.props,
			{ user } = this.state;
		
		return { route, query, user, fetchAuth, deleteAuth, nextReady };
	}

	render({ children }) { return (
		<AppContext.Provider value={ this.contextObject }>
			<Header/>
			{ children }
		</AppContext.Provider>
	); }
}

//	Exports.
export { App };
