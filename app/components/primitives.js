/** 
*	Basic components. The styling for these components lives in the base 
*	stylesheet.
*/
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import history from '../history';
import contextual from '../app-context';

/** A button. */
class Button extends Component {
	render({ onClick, type, icon, label }) { return (
		<button onClick={ onClick } class={ type || null }>
			{ icon && <i class={ 'fa fa-' + this.props.icon }/> }
			{ label && <span class="label">{ label }</span> }
		</button>
	); }
}

/** A link. */
@contextual
class Link extends Component {
	/** Follow this link. */
	@bound
	follow(event=null) {
		history.push(this.props.href);

		if (event) event.preventDefault();
	}

	render({ href, context, type, icon, label }) { return (
		<button onClick={ this.follow } class={ 
			(type || '') + (context.route == href ? ' current' :'') 
		}>
			{ icon && <i class={ 'fa fa-' + icon }/> }
			<a href={ href }><span>{ label }</span></a>
		</button>
	); }
}

/** A "loading" spinner. */
class Spinner extends Component {
	render({ center }) { return (
		<i class={ 
			'fa fa-spinner fa-spin load-spinner' +
			(center ? ' centered' : '')
		}/>
	); }
}

//	Exports.
export { Button, Link, Spinner };
