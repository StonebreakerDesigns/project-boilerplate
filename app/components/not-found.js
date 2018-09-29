/** Routing fallback. */
import { Component, h } from 'preact';

import contextual from '../app-context';
import styled from '../styled';
import style from './not-found.less';

/** The 404 page-like component. */
@contextual
@styled(style)
class NotFoundPage extends Component {
	componentWillMount() {
		this.props.context.hideHeader();
	}

	componentWillUnmount() {
		this.props.context.showHeader();
	}

	render() { return (
		<em>Not Found</em>
	); }
}

//	Export.
export default NotFoundPage;