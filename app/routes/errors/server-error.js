/** The 500 page. */
import { Component, h } from 'preact';

import { PageErrorLayout } from '../../components/layouts';

const ERROR_DESC = "Something went wrong, we're working on it!";

/** The page. */
class ServerErrorPage extends Component {
	render() { return (
		<PageErrorLayout title="Server Error">
			{ ERROR_DESC }
		</PageErrorLayout>
	); }
}

//	Export.
export default {
	status: 500, 
	metadata: {title: 'Server Error', description: ERROR_DESC},
	component: ServerErrorPage
};
