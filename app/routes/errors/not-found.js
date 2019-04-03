/** The 404 page. */
import { Component, h } from 'preact';

import { PageErrorLayout } from '../../components/layouts';

const ERROR_DESC = "That page doesn't exist.";

/** The page. */
class NotFoundPage extends Component {
	render() { return (
		<PageErrorLayout title="Not Found">
			{ ERROR_DESC }
		</PageErrorLayout>
	); }
}

//	Export.
export default {
	status: 404,
	metadata: {title: 'Not Found', description: ERROR_DESC},
	component: NotFoundPage
};
