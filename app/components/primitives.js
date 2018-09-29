/** 
*	Basic components. The styling for these components lives in the base 
*	stylesheet.
*/
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import history from '../history';
import contextual from '../app-context';

/** An icon. */
class Icon extends Component {
	render({ name }) { return <i class={ 
		'fa fa-' + name + ' ' + (this.props.class || '')
	}/>; }
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

/** A button. */
class Button extends Component {
	render({ onClick, variant, icon, label }) { return (
		<button onClick={ onClick } class={ variant || null }>
			{ icon && <Icon name={ icon }/> }
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

	render({ href, context, variant, icon, label }) { return (
		<button onClick={ this.follow } class={ 
			(variant || '') + (context.route == href ? ' current' :'') 
		}>
			{ icon && <Icon name={ icon }/> }
			<a href={ href }><span>{ label }</span></a>
		</button>
	); }
}

//	Exports.
export { Icon, Button, Link, Spinner };
