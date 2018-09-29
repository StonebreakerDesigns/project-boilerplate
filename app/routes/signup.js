/** Signup page. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import { post } from '../request';
import contextual from '../app-context';
import { Button } from '../components/primitives';
import { 
	Field, RequiredPasswordValidator, RequiredEmailValidator,
	collectFields
} from '../components/fields';

/** The signup page. */
@contextual
class SignupPage extends Component {
	constructor(props) {
		super(props);

		//	Create validators.
		this.emailValidator = new RequiredEmailValidator();
		this.passwordValidator = new RequiredPasswordValidator();

		this.state = {
			formError: null
		}
	}

	@bound
	async submit() {
		let info = collectFields(this, {
			email: 'email_address',
			password: 'password',
			confirmPassword: 'confirm_password'
		});
		if (!info) return;

		let resp = await post({
			route: '/users',
			json: info
		});
		console.log(resp);
	}
	
	render({}, { formError }) { return (
		<div id="signup-page" class="al-center">
			<div class="col-6 max-400 component">
				<h2>Sign up</h2>
				{ formError && <em>{ formError }</em> }
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
