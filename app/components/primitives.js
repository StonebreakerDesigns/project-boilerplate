/**  Basic components. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import history from '../history';

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
	render({ icon, label, ...props }) { return (
		<button {...props}>
			{ icon && <Icon name={ icon }/> }
			{ label }
		</button>
	); }
}

/** A link. */
class Link extends Component {
	/** Follow this link. */
	@bound
	follow(event=null) {
		let { href } = this.props;
		history.push(href);
		if (event) event.preventDefault();
	}

	render({ href, icon, label, ...props }) { return (
		<a class={ props.class } href={ href } onClick={ this.follow }>
			{ icon && <Icon name={ icon }/> }
			{ label }
		</a>
	); }
}

//	Exports.
export { Icon, Button, Link, Spinner };
