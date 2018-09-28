import { Component, h } from 'preact';

import config from '../config';
import './flash-messages.less';

export default class FlashMessages extends Component {
	constructor(props) {
		super(props);

		this.state = {
			messages: []
		}
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

	render() {
		return <div id="flash-messages">
			{ this.state.messages.map(mo => 
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