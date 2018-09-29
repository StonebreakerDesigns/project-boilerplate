/** The site header. Can be hidden and revealed via the app context. */
import { Component, h } from 'preact';

import styled from '../style-context';
import HeaderUserPanel from './header-user-panel';
import style from './header.less';

/** The site header. */
@styled(style)
class Header extends Component {
	constructor(props) {
		super(props);

		this.state = {
			visible: true
		};
	}

	componentWillMount() {
		this.props.appBinding(this);
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
