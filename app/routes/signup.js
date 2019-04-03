/** Signup page. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import config from '../config';
import history from '../history';
import contextual from '../app-context';
import { post } from '../requests';
import { noUser } from '../auth';
import { Button } from '../components/primitives';
import {
	Field, FieldContext, required, passwordFormat, 
	emailFormat, mergeValidators
} from '../components/fields';

/** The signup page. */
@contextual
class SignupPage extends Component {
	constructor(props) {
		super(props);

		this.state = { error: null };
	}

	@bound
	async submit() {
		try {
			await post({
				route: '/users',
				expect: 201,
				jsonSource: this
			});
		}
		catch (err) {
			if (err.isFormInvalidation) return;
			if (err.status != 422) throw err;
			
			this.setState({formError: err.json.message});
			return;
		}

		let { context: {fetchAuth}} = this.props;
		await fetchAuth();
		history.push(config.behaviour.postAuthDest + '?v=welcome');
	}
	
	render({}, { error }) { return (
		<div id="signup-page" class="al-c">
			<div class="col-6 al-l">
				<h2 class="pad-vb">Sign up</h2>
				<FieldContext parent={ this } error={ error }>
					<Field
						id="email_address" label="Email address"
						validator={ mergeValidators(required, emailFormat) }
					/>
					<Field
						id="password" type="password" 
						label="Password"
						validator={ mergeValidators(required, passwordFormat) }
					/>
					<Field
						id="confirm_password" type="password" 
						label="Confirm password"
						validator={ mergeValidators(required, passwordFormat) }
					/>
				</FieldContext>
				<div class="al-r">
					<Button label="Sign up" onClick={ this.submit }/>
				</div>
			</div>
		</div>
	); }
}

//	Export.
export default {
	metadata: {title: 'Sign up', description: 'Create an account.'},
	authCheck: noUser,
	component: SignupPage
};
