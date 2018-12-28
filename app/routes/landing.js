/** The landing / homepage. */
import { Component, h } from 'preact';

import styled from '../bind-style';
import contextual from '../bind-context';
import { Link, Button } from '../components/primitives';
import { Modal } from '../components/modals';
import Brand from '../../art/brand.svg';
import style from './landing.less';

/** The homepage component. */
@contextual
@styled(style)
class LandingPage extends Component {
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
			<Link 
				label="Go Somewhere" icon="heart"
				href="/somewhere" class="button"
			/>
			<Button 
				label="See something" icon="eye" 
				onClick={ () => this.modal.open() }
			/>
		</div>
	); }
}

//	Export.
export default {
	title: 'Landing',
	component: LandingPage
};
