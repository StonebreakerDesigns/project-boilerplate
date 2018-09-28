import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import history from '../history';
import { withContext } from '../app-context';
import './homepage.less';

@withContext
class Homepage extends Component {
	constructor(props) {
		super(props);
		
		this.greetings = 1;
	}

	@bound
	greet() {
		this.props.context.flashMessage(`
			Hello, ${ this.greetings } time${ this.greetings > 1 ? 's' : '' }!
		`);
		this.greetings++;
	}

	render() {
		return <div id="landing" onClick={ this.greet }>
			<img src="/static/stonebreaker.jpg"/>
			<h1>Sup?</h1>
			<p>You're good to go; get creating!</p>
		</div>
	}
}

export default {
	title: 'Landing',
	component: Homepage
}