/** Signup page. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import history from '../history';
import { post } from '../request';
import contextual from '../app-context';
import { deauthenticate } from '../auth';
import { Button } from '../components/primitives';
import { 
	Field, FormError, RequiredPasswordValidator, RequiredEmailValidator,
	collectFields
} from '../components/fields';

/** The signup page. */
@contextual
@deauthenticate
class SignupPage extends Component {
	constructor(props) {
		super(props);

		//	Create validators.
		this.emailValidator = new RequiredEmailValidator();
		this.passwordValidator = new RequiredPasswordValidator();

		this.state = {
			formError: null
		};
	}

	@bound
	async submit() {
		let info = collectFields(this, {
			email: 'email_address',
			password: 'password',
			confirmPassword: 'confirm_password'
		});
		if (!info) return;

		try {
			await post({
				route: '/users',
				expect: 201,
				json: info
			});
		}
		catch (err) {
			if (err.status != 422) throw err;
			
			this.setState({formError: err.json.message});
			return;
		}

		await this.props.context.fetchAuth();
		history.push('/dashboard?v=welcome');
	}
	
	render({}, { formError }) { return (
		<div id="signup-page" class="al-center">
			<div class="col-6 max-400 component">
				<h2>Sign up</h2>
				<FormError error={ formError }/>
				<Field
					id="email"
					type="text"
					label="Email address"
					validator={ this.emailValidator }
					parent={ this }
				/>
				<Field
					id="password"
					type="password"
					label="Password"
					validator={ this.passwordValidator }
					parent={ this }
				/>
				<Field
					id="confirmPassword"
					type="password"
					label="Confirm password"
					validator={ this.passwordValidator }
					parent={ this }
				/>
				<div class="al-right">
					<Button label="Sign up" onClick={ this.submit }/>
				</div>
			</div>
		</div>
	); }
}

//	Export.
export default {
	title: 'Sign Up',
	component: SignupPage
};
