import { Component, h } from 'preact';

import history from '../history';

class Homepage extends Component {
	render() {
		return <h1 onClick={ () => history.push('/somewhere') }>
			Hi!
		</h1>
	}
}

export default Homepage;