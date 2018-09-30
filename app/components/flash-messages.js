/** Flash messages for presenting notifications to the user. */
import { Component, h } from 'preact';

import config from '../config';
import styled from '../style-context';
import { Icon } from './primitives';
import style from './flash-messages.less';

/** 
*	The flash messages component. It's functionality is accessed through the
*	app context. 
*/
@styled(style)
class FlashMessages extends Component {
	constructor(props) {
		super(props);

		this.currentID = 0;
		this.state = {
			messages: []
		};
	}

	componentWillMount() {
		this.props.appBinding(this);
	}

	/** Add a message. Powers the `flashMessage` function.  */
	add(message) {
		let messageObj = {
			id: this.currentID++,
			content: message,
			out: true
		};

		//	Create.
		let messages = [...this.state.messages];
		messages.push(messageObj);
		this.setState({ messages });

		//	Setup lifecycle.
		setTimeout(() => {
			messageObj.out = false;
			this.forceUpdate();
		}, 10);
		setTimeout(() => {
			messageObj.out = true;
			this.forceUpdate();
		}, config.flashMessages.flashTime);
		setTimeout(() => {
			let lessMessages = [...this.state.messages];
			lessMessages.splice(lessMessages.indexOf(messageObj), 1);
			this.setState({messages: lessMessages});
		}, config.flashMessages.flashTime + 1000);
	}

	render({}, { messages }) { return (
		<div id="flash-messages">
			{ messages.map(msg => 
				<div key={ msg.id } class={
					'flash-message' + (msg.out ? ' out' : '')
				}>
					<Icon name="exclamation-triangle" class="warning-icon"/>
					<div class="content-container">
						{ msg.content }
					</div>
				</div>
			) }
		</div>
	); }
}

//	Export.
export default FlashMessages;