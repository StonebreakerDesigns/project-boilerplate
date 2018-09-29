/** In-header user account info. */
import { Component, h } from 'preact';

import contextual from '../app-context';
import { Link } from './primitives';

/**
*	A component that lives in the header and presents usership information.
*/
@contextual
class HeaderUserPanel extends Component {
	render({ context }) { 
		const loggedIn = !!context.user;

		return (
			<div id="user-panel"> { loggedIn ?
				context.user.email_address
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
