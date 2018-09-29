/** Flash messages for presenting notifications to the user. */
import { Component, h } from 'preact';

import config from '../config';
import styled from '../style-context';
import style from './flash-messages.less';

/** 
*	The flash messages component. It's functionality is accessed through the
*	app context. 
*/
@styled(style)
class FlashMessages extends Component {
	constructor(props) {
		super(props);

		this.state = {
			messages: []
		};
	}

	componentWillMount() {
		this.props.appBinding(this);
	}

	/** Add a message. Powers the `flashMessage` function.  */
	add(message) {
		//	Create a message object.
		let messageObj = {
			message: message, 
			present: false,
			exists: true
		};

		//	Setup lifecycle.
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

	render({}, { messages }) { return (
		<div id="flash-messages">
			{ messages.map(mo => 
				<div key={ mo.message } class={
					'flash-message' + (mo.present ? ' present' : '') +
					(mo.exists ? '' : ' hidden')
				}>
					{ mo.message }
				</div>
			) }
		</div>
	); }
}

//	Export.
export default FlashMessages;