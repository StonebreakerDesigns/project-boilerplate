/** The site header. Can be hidden and revealed via the app context. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import styled from '../bind-style';
import contextual from '../bind-context';
import history from '../history';
import { Button, Link } from './primitives';
import style from './header.less';

/** Usership header. */
@contextual
class HeaderUserPanel extends Component {
	/** Handle a logout event. */
	@bound
	async handleLogout() {
		const { context: { deleteAuth }} = this.props;

		await deleteAuth();
		history.push('/login');
	}

	render({ context: { user } }) { return (
		<div id="user-panel">{ user ?
			<span>
				{ user.email_address }
				<Button label="Log out" onClick={ this.handleLogout }/>
			</span>
			:
			<span>
				Not logged in
				<Link label="Log in" href="/login" class="button"/>
				<Link label="Sign up" href="/signup" class="button"/>
			</span>
		}</div>
	); }
}

/** The site header. */
@styled(style)
class Header extends Component {
	constructor(props) {
		super(props);

		this.state = { visible: true };
	}

	componentWillMount() {
		this.props.binding(this);
	}

	/** Toggle the visibility of the header. */
	setVisible(visible) {
		this.setState({ visible });
	}

	render({}, { visible }) { return (
		<div id="header" class={ visible ? '' : ' collapsed'}>
			<div class="brand">A clean slate...</div>
			<HeaderUserPanel/>
		</div>
	); }
}

//	Export.
export default Header;
