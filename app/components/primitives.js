/**  Basic components. */
import { Component, h } from 'preact';

import config from '../config'
import { linkProps } from '../history';

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
	render({ href, icon, label, ...props }) { return (
		<a class={ props.class } {...linkProps(href)}>
			{ icon && <Icon name={ icon }/> }
			{ label }
		</a>
	); }
}

//	Exports.
export { Icon, Button, Link, Spinner };
