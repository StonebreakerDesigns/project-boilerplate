import React from 'react';

import history from '../history';
import metadata from './route-metadata';

@metadata({title: 'Sup'})
class Homepage extends React.Component {
	render() {
		return <h1 onClick={ () => history.push('/somewhere') }>
			Hi!
		</h1>
	}
}

export default Homepage;