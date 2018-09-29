/** The landing / homepage. */
import { Component, h } from 'preact';

import styled from '../style-context';
import contextual from '../app-context';
import { Link } from '../components/primitives';
import Brand from '../svgs/brand.svg';
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
			<div class="brand-container">
				<Brand/>
			</div>
			<p>Get creating!</p>
			<Link label="Go Somewhere" icon="heart" href="/somewhere"/>
		</div>
	); }
}
const route = {
	title: 'Landing',
	component: Homepage
};

//	Export.
export default route;
