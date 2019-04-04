/** The site header. Can be hidden and revealed via the app context. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import styled from '../style-context';
import contextual from '../app-context';
import history, { linkProps } from '../history';
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
		<div id="user-panel" class="ilb w-50pct al-r pad-h">{ user ?
			<span>
				<div class="ilb mar-hr sm-t l-tc">
					{ user.email_address }
				</div>
				<Button label="Log out" onClick={ this.handleLogout }/>
			</span>
			:
			<span>
				<div class="ilb mar-hr sm-t l-tc">
					Not logged in
				</div>
				<Link label="Log in" href="/login" class="button"/>
				<Link label="Sign up" href="/signup" class="button light"/>
			</span>
		}</div>
	); }
}

/** The site header. */
@styled(style)
class Header extends Component {
	render() { return (
		<div id="header">
			<a class="ilb w-50pct pad l-tc" {...linkProps('/')}>
				<Icon name="plus-square" class="hmar-hr"/>
				A new project
			</a>
			<HeaderUserPanel/>
		</div>
	); }
}

//	Export.
export default Header;
