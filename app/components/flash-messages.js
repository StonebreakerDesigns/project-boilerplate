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

		this.state = {
			messages: []
		};
	}

	componentWillMount() {
		this.props.appBinding(this);
	}

	/** Add a message. Powers the `flashMessage` function.  */
	add(message) {
		//	Setup lifecycle.
		let messages = [...this.state.messages];
		messages.push(message);
		this.setState({ messages });
		setTimeout(() => {
			let lessMessages = [...this.state.messages];
			lessMessages.splice(lessMessages.indexOf(message), 1);
			this.setState({messages: lessMessages});
		}, config.flashMessages.flashTime);
	}

	render({}, { messages }) { return (
		<div id="flash-messages">
			{ messages.map((message, i) => 
				<div key={ i } class="flash-message">
					<Icon name="exclamation-triangle" class="warning-icon"/>
					{ message }
				</div>
			) }
		</div>
	); }
}

//	Export.
export default FlashMessages;