/** The 403 page. */
import { Component, h } from 'preact';

import { ErrorDisplay } from '../../components/error-display';

/** The page. */
class ForbiddenPage extends Component {
	render() { return (
		<ErrorDisplay title="Forbidden">
			You're not allowed to see this page.
		</ErrorDisplay>
	); }
}

//	Export.
export default {
	status: 403, title: 'Forbidden', component: ForbiddenPage
};
