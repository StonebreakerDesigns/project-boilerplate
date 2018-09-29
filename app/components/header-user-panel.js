/** In-header user account info. */
import { Component, h } from 'preact';

import contextual from '../app-context';

/**
*	A component that lives in the header and presents usership information.
*/
@contextual
class HeaderUserPanel extends Component {
	render({ context }) { return (
		<div id="user-panel"> { 
			(context.user && context.user.email_address) || 'Not logged in' 
		} </div>
	); }
}
export default HeaderUserPanel;
