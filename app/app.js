/**
*	The isomorphic application root. Provides the application context. Any 
*	components that want to the contribute to the application context must be 
*	integrated with this component.
*/
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import styled from './styled';
import { AppContext } from './app-context'; 
import FlashMessages from './components/flash-messages';
import Header from './components/header';
import style from './app.less';

/**
*	The root application component. 
*/
@styled(style)
class App extends Component {
	constructor(props) {
		super(props);

		//	Create the app context.
		this.appContext = {
			flashMessage: this.flashMessage,
			showHeader: this.showHeader,
			hideHeader: this.hideHeader
		};
	}

	/**
	*	Flash a message. Should be accessed through the app context.
	*/
	@bound
	flashMessage(message) {
		this.flashMessages.add(message);
	}

	/**
	*	Reveal the header. Should be accessed through the app context.
	*/
	@bound
	showHeader() {
		this.header.setVisible(true);
	}

	/**
	*	Hide the header. Should be accessed through the app context.
	*/
	@bound
	hideHeader() {
		this.header.setVisible(false);
	}

	render() { return (
		<div id="app-root">
			<AppContext.Provider value={ this.appContext }>
				<Header appBinding={ c => this.header = c }/>
				{ this.props.children }
				<FlashMessages appBinding={ c => this.flashMessages = c }/>
			</AppContext.Provider>
		</div>
	); }
}

//	Exports.
export default App;