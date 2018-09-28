/* The site header. Can be hidden an revealed via the app context. */
import { Component, h } from 'preact';

import styled from '../styled';
import style from './header.less';

@styled(style)
export default class Header extends Component {
	/* The site header. */
	constructor(props) {
		super(props);

		this.state = {
			visible: true
		}
	}

	componentWillMount() {
		this.props.appBinding(this);
	}

	setVisible(visible) {
		this.setState({ visible });
	}

	render({}, { visible }) {
		//	XXX: Project specific site header.
		return <div id="header" class={ visible ? "" : " collapsed"}>
			<h1>An App!</h1>
		</div>
	}
}
