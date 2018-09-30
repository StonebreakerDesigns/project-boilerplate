/** Login page. */
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

/** The login page. */
@contextual
@deauthenticate
class LoginPage extends Component {
	constructor(props) {
		super(props);

		//	Create validators.
		this.emailValidator = new RequiredEmailValidator();
		this.passwordValidator = new RequiredPasswordValidator();

		this.state = {
			formError: null,
			resetRequest: false
		};
	}

	/** Handle password reset workflow start. */
	@bound
	handleResetStart() {
		this.setState({resetRequest: true});
	}
	/** Handle password reset workflow backout. */
	@bound
	cancelResetRequest() {
		this.setState({resetRequest: false});
	}
	/** Send a password reset request. */
	@bound
	async requestPasswordReset() {
		let request = collectFields(this, {
			email: 'email_address'
		});
		if (!request) return;

		await post({
			route: '/auth/request-password-reset',
			json: request
		});
		const context = this.props.context;
		//	eslint-disable-next-line quotes
		context.flashMessage("We've sent your reset link");
		this.setState({resetRequest: false});
	}

	@bound
	async submit() {
		let credentials = collectFields(this, {
			email: 'email_address',
			password: 'password'
		});
		if (!credentials) return;

		try {
			await post({
				route: '/auth',
				json: credentials
			});
		}
		catch (err) {
			if (err.status != 401) throw err;

			this.setState({formError: err.json.message});
			return;
		}

		await this.props.context.fetchAuth();
		history.push(this.props.context.query.r || '/dashboard');
	}

	render({}, { formError, resetRequest }) { return (
		<div id="login-page" class="al-center">
			{ !resetRequest ?
				<div class="col-6 max-4h component">
					<h2>Log in</h2>
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
					<div class="al-right">
						<Button label="Sign in" onClick={ this.submit }/>
					</div>
					<em 
						class="pad-vt pointer"
						onClick={ this.handleResetStart }
					>Forgot your password?</em>
				</div>
				:
				<div class="col-6 max-400 component">
					<h3>Request password reset</h3>
					<p>
						Enter your email address and we'll send you a reset
						link.
					</p>
					<Field
						id="email"
						type="text"
						label="Your email address"
						validator={ this.emailValidator }
						parent={ this }
					/>
					<div class="al-right">
						<Button 
							label="Cancel" 
							variant="warn" 
							onClick={ this.cancelResetRequest }
						/>
						<Button
							label="Send reset link"
							onClick={ this.requestPasswordReset }
						/>
					</div>
				</div>
			}
		</div>
	); }
}

export default {
	title: 'Log in',
	component: LoginPage
};