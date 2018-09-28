/* The application root. */
import { Component, h } from 'preact';

export default class App extends Component {
	render() {
		return <div id="app">{ this.props.children }</div>
	}
}
