/** The 500 page. */
import { Component, h } from 'preact';

import { ErrorDisplay } from '../../components/error-display';

/** The page. */
class ServerErrorPage extends Component {
	render() { return (
		<ErrorDisplay title="Server Error">
			Something went wrong, we're working on it.
		</ErrorDisplay>
	); }
}

//	Export.
export default {
	status: 500, title: 'Server Error', component: ServerErrorPage
};
