/* The application root. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import styled from './styled';
import { AppContext } from './app-context'; 
import FlashMessages from './components/flash-messages';
import style from './app.less';

@styled(style)
export default class App extends Component {
	constructor(props) {
		super(props);

		this.appContext = {
			flashMessage: this.flashMessage
		};
	}

	@bound
	flashMessage(message) {
		this.flashMessages.add(message);
	}

	render() {
		return <div id="app">
			<AppContext.Provider value={ this.appContext }>
				{ this.props.children }
			</AppContext.Provider>
			<FlashMessages appBinding={ c => this.flashMessages = c }/>
		</div>
	}
}
