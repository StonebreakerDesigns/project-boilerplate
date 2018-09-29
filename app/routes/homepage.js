/** The landing / homepage. */
import { Component, h } from 'preact';

import styled from '../styled';
import contextual from '../app-context';
import style from './homepage.less';

/** The homepage component. */
@contextual
@styled(style)
class Homepage extends Component {
	constructor(props) {
		super(props);
	}

	render() { return (
		<div id="landing">
			<img src="/static/stonebreaker.jpg"/>
			<p>You're good to go; get creating!</p>
		</div>
	); }
}
const route = {
	title: 'Landing',
	component: Homepage
};

//	Export.
export default route;