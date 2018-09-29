/** Routing fallback. */
import { Component, h } from 'preact';

import history from '../history';
import contextual from '../app-context';
import styled from '../style-context';
import { Button } from './primitives';
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
		<div id="not-found">
			<em class="pad-vb">Not Found</em>
			<br/>
			<Button label="back" onClick={ () => history.goBack() }/>
		</div>
	); }
}

//	Export.
export default NotFoundPage;
