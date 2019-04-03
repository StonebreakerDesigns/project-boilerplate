/** The landing / homepage. */
import { Component, h } from 'preact';

import contextual from '../app-context';
import Brand from '../svg/brand.svg';

/** The landing component. */
@contextual
class LandingPage extends Component {
	constructor(props) {
		super(props);
	}

	render() { return (
		<div id="landing" class="al-c">
			<div class="mx-w-300px mar-a ts bs">
				<Brand/>
				</div>
			<div class="pad-vt">
				You're up and running... get creating!
			</div>
		</div>
	); }
}

//	Export.
export default {
	metadata: {
		title: 'Landing', 
		description: 'This is a placeholder landing page.'
	},
	component: LandingPage
};
