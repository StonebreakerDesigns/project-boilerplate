/**  Basic components. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import config from '../config'
import history from '../history';

/** An icon. */
class Icon extends Component {
	render({ name, ...props }) { return (
		<i class={ [
			config.iconSheet, 'fa-' + name, props.class, 'icon'
		] }/>
	); }
}

/** A "loading" spinner. */
class Spinner extends Component {
	render(props) { return (
		<i class={ [
			config.iconSheet, 'fa-spinner fa-spin', props.class
		] }/>
	); }
}

/** A button. */
class Button extends Component {
	render({ icon, label, ...props }) { return (
		<button {...props} class={ ['button ', props.class] }>
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
		if (event) event.preventDefault();

		let { href } = this.props;
		history.push(href);
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
