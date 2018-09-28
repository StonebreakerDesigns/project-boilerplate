import { Component, h } from 'preact';
import a from 'isomorphic-style-loader/lib';

import config from '../config';
import styled from '../styled';
import style from './flash-messages.less';

@styled(style)
export default class FlashMessages extends Component {
	constructor(props) {
		super(props);

		this.state = {
			messages: []
		}
	}

	componentWillMount() {
		this.props.appBinding(this);
	}

	add(message) {
		let messageObj = {
			message: message, 
			present: false,
			exists: true
		};

		let messages = [...this.state.messages];
		messages.push(messageObj);
		this.setState({ messages });
		setTimeout(() => {
			messageObj.present = true;
			this.forceUpdate();
		}, config.flashMessages.fadeTime);
		setTimeout(() => {
			messageObj.present = false;
			this.forceUpdate();
		}, config.flashMessages.totalTime - config.flashMessages.fadeTime);
		setTimeout(() => {
			messageObj.exists = false;
		}, config.flashMessages.totalTime);
	}

	render({}, { messages }) {
		return <div id="flash-messages">
			{ messages.map(mo => 
				<div class={ 
					"flash-message" + (mo.present ? " present" : "") +
					(mo.exists ? "" : " hidden")
				}>
					{ mo.message }
				</div>
			) }
		</div>
	}
}