/* The application root. Provides the application context. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import styled from './styled';
import { AppContext } from './app-context'; 
import FlashMessages from './components/flash-messages';
import Header from './components/header';
import style from './app.less';

//	XXX: Any components that want to the contribute to the application
//		context must be integrated with this component.

@styled(style)
export default class App extends Component {
	/* The root application component. */
	constructor(props) {
		super(props);

		//	Create the app context.
		this.appContext = {
			flashMessage: this.flashMessage,
			showHeader: this.showHeader,
			hideHeader: this.hideHeader
		};
	}

	@bound
	flashMessage(message) {
		this.flashMessages.add(message);
	}

	@bound
	showHeader() {
		this.header.setVisible(true);
	}

	@bound
	hideHeader() {
		this.header.setVisible(false);
	}

	render() {
		return <div id="app-root">
			<AppContext.Provider value={ this.appContext }>
				<Header appBinding={ c => this.header = c }/>
				{ this.props.children }
				<FlashMessages appBinding={ c => this.flashMessages = c }/>
			</AppContext.Provider>
		</div>
	}
}
