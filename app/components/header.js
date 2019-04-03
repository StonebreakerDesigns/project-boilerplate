/** The site header. Can be hidden and revealed via the app context. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import styled from '../style-context';
import contextual from '../app-context';
import history from '../history';
import { Button, Link, Icon } from './primitives';
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
		<div id="user-panel" class="ilb w-50pct al-r pad">{ user ?
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
	render() { return (
		<div id="header">
			<div class="ilb w-50pct pad">
				<Icon name="plus-square" class="hmar-hr"/>
				New project
			</div>
			<HeaderUserPanel/>
		</div>
	); }
}

//	Export.
export default Header;
