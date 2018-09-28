/* The 404 page component. */
import { Component, h } from 'preact';

import withContext from '../app-context';

@withContext
class NotFoundPage extends Component {
	componentWillMount() {
		this.props.context.hideHeader();
	}

	componentWillUnmount() {
		this.props.context.showHeader();
	}

	render() {
		return <em>Not Found</em>
	}
}
export default NotFoundPage;