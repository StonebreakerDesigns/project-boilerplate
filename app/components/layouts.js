/** Abstract, high-level layouts. */
import { Component, h } from 'preact';

import { Link } from './primitives';

/** A helper base for components with semantic children. */
class PickyParentComponent extends Component {
	/** Return the child of the given type. */
	_getChild(cType, optional=false) {
		let existing = this.props.children.filter(c => c && c.nodeName == cType);
		if (optional && existing.length == 0) return null;
		if (existing.length != 1) throw new Error('Missing required child');
		return existing[0].children;
	}
}

class PageErrorLayout extends Component {
	render({ title, children }) { return (
		<div id="error-page" class="al-c ts">
			<h1 class="pad-vb">{ title }</h1>
			<div class="hpad-v">{ children }</div>
			<div class="hpad-vt">
				<Link label="Back to site" href="/"/>
			</div>
		</div>
	); }
}

//  Exports.
export { PageErrorLayout };