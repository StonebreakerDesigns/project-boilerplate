/** Dashboard page. */
import { Component, h } from 'preact';

import contextual from '../app-context';
import { authenticate } from '../auth';

/** The dashboard page. */
@contextual
@authenticate
class DashboardPage extends Component {
	render({ context }) { return context.user && (
		<div id="dashboard">
			<h1 class="al-center">{ context.user.email_address }</h1>
		</div>
	); }
}

//	Export.
export default {
	title: 'Dashboard',
	component: DashboardPage
};