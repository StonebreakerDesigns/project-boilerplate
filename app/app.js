/** The isomorphic application root components. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import config from './config';
import { get, delete_ } from './requests';
import styled from './bind-style';
import { AppContext } from './bind-context'; 
import Header from './components/header';
import style from './app.less';

/** The root application component. */
@styled(style)
class App extends Component {
	constructor(props) {
		super(props);

		this.state = { user: null, authFetched: false };
	}

	componentDidMount() {
		let { binding } = this.props;

		if (binding) binding(this);
		this.fetchAuth();	
	}

	/** Fetch the currently authenticated user. */
	@bound
	async fetchAuth() {
		let authFetch = await get('/auth');

		let user = authFetch.status == 'success' ? authFetch.data : null;
		this.setState({ authFetched: true, user });
		return user;
	}

	/** Delete the current authentication session. */
	@bound
	async deleteAuth() {
		await delete_('/auth');
		this.setState({user: null});
	}

	/** Show the header. Should be accessed through the app context. */
	@bound
	toggleHeader(flag) {
		this.header.setVisible(flag);
	}

	render({ route, query, children }, { authFetched, user }) {
		const { fetchAuth, deleteAuth, toggleHeader } = this,
			context = {
				route, query, user, authFetched, fetchAuth, deleteAuth, toggleHeader
			};
		//	Maybe provide debug access.
		if (typeof window !== 'undefined' && config.debug) window.context = context;

		return (
			<AppContext.Provider value={ context }>
				<Header binding={ c => this.header = c }/>
				{ children }
			</AppContext.Provider>
		); 
	}
}

//	Exports.
export default App;
