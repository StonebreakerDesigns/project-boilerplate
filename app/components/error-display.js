/** General error display. */
import { Component, h } from 'preact';

import styled from '../bind-style';
import { Link } from './primitives';
import style from './error-display.less';

/** An error display component. */
@styled(style)
class ErrorDisplay extends Component {
	render({ title, children }) { return (
		<div class="error-display">
			<h1>{ title }</h1>
			<div class="error-info">{ children }</div>
			<div class="error-after">
				<Link label="Back to site" href="/"/>
			</div>
		</div>
	); }
}

//	Export.
export { ErrorDisplay };