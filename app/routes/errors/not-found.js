/** The 404 page. */
import { Component, h } from 'preact';

import { ErrorDisplay } from '../../components/error-display';

/** The page. */
class NotFoundPage extends Component {
	render() { return (
		<ErrorDisplay title="Not Found">
			That page doesn't exist.
		</ErrorDisplay>
	); }
}

//	Export.
export default {
	status: 404, title: 'Not Found', component: NotFoundPage
};
