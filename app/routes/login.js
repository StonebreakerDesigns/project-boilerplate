/** Login page. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import styled from '../bind-style';
import history from '../history';
import { noUser } from '../authorities';
import { post } from '../requests';
import { Button } from '../components/primitives';
import { 
	Field, FormError, required, passwordFormat, emailFormat, mergeValidators
} from '../components/fields';
import style from './login.less';

/** The login page. */
@styled(style)
class LoginPage extends Component {
	constructor(props) {
		super(props);

		this.state = { error: null, reseting: false };
	}

	/** Handle password reset workflow start. */
	@bound
	handleResetStart() { this.setState({reseting: true}); }
	/** Handle password reset workflow backout. */
	@bound
	cancelResetRequest() { this.setState({reseting: false}); }

	/** Send a password reset request. */
	@bound
	async requestPasswordReset() {
		let request = this.fields.collect_();
		if (!request) return;

		await post({
			route: '/auth/request-password-reset',
			json: request
		});
		this.setState({reseting: false});
	}

	@bound
	async submit() {
		let credentials = this.fields.collect_();
		if (!credentials) return;

		try {
			await post({
				route: '/auth',
				json: credentials
			});
		}
		catch (err) {
			if (err.status != 401) throw err;

			this.setState({error: err.json.message});
			return;
		}

		await this.props.context.fetchAuth();
		history.push(this.props.context.query.r || '/dashboard');
	}

	render({}, { error, reseting }) { return (
		<div id="login-page">
			{ !reseting ?
				<div class="login-area">
					<h2>Log in</h2>
					<FormError error={ error }/>
					<Field
						parent={ this } id="email_address"
						label="Email address"
						validator={ mergeValidators(required, emailFormat) }
					/>
					<Field
						parent={ this } id="password"
						type="password" label="Password"
						validator={ mergeValidators(required, passwordFormat) }
					/>
					<div class="login-actions">
						<Button label="Sign in" onClick={ this.submit }/>
					</div>
					<div onClick={ this.handleResetStart }>
						Forgot your password?
					</div>
				</div>
				:
				<div class="reset-area">
					<h3>Request password reset</h3>
					<p>
						Enter your email address and we'll send you a reset
						link.
					</p>
					<Field
						parent={ this } id="email"
						label="Your email address"
						validator={ this.emailValidator }
					/>
					<div class="reset-actions">
						<Button 
							label="Cancel" onClick={ this.cancelResetRequest }
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
	authority: noUser,
	component: LoginPage
};