/** The 403 page. */
import { Component, h } from 'preact';

import { PageErrorLayout } from '../../components/layouts';

const ERROR_DESC = "You're not allowed to see this page.";

/** The page. */
class ForbiddenPage extends Component {
	render() { return (
		<PageErrorLayout title="Forbidden">
			{ ERROR_DESC }
		</PageErrorLayout>
	); }
}

//	Export.
export default {
	status: 403,
	metadata: {title: 'Forbidden', description: ERROR_DESC},
	component: ForbiddenPage
};
