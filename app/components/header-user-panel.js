/** In-header user account info. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import history from '../history';
import contextual from '../app-context';
import { Link, Button } from './primitives';

/**
*	A component that lives in the header and presents usership information.
*/
@contextual
class HeaderUserPanel extends Component {
	/** Handle a logout event. */
	@bound
	async handleLogout() {
		const context = this.props.context;

		await context.deleteAuth();
		//	eslint-disable-next-line quotes
		context.flashMessage("You've been logged out");
		history.push('/login');
	}

	render({ context }) { 
		const loggedIn = !!context.user;

		return (
			<div id="user-panel"> { loggedIn ?
				<span>
					{ context.user.email_address }
					<Button label="Log out" onClick={ this.handleLogout }/>
				</span>
				:
				<span>
					<em>Not logged in</em>
					<Link label="Log in" href="/login"/>
					<Link label="Sign up" href="/signup"/>
				</span>
			} </div>
		); 
	}
}
export default HeaderUserPanel;
