/** The landing / homepage. */
import { Component, h } from 'preact';

import styled from '../style-context';
import contextual from '../app-context';
import { Link, Button } from '../components/primitives';
import { Modal } from '../components/modals';
import Brand from '../svgs/brand.svg';
import style from './homepage.less';

/** The homepage component. */
@contextual
@styled(style)
class Homepage extends Component {
	constructor(props) {
		super(props);

		this.modal = null;
	}

	render() { return (
		<div id="landing">
			<Modal binding={ m => this.modal = m }>
				<h1>Definitely something</h1>
			</Modal>
			<div class="brand-container">
				<Brand/>
			</div>
			<p>Get creating!</p>
			<Link label="Go Somewhere" icon="heart" href="/somewhere"/>
			<Button 
				label="See something" icon="eye" 
				onClick={ () => this.modal.open() }
			/>
		</div>
	); }
}
const route = {
	title: 'Landing',
	component: Homepage
};

//	Export.
export default route;
