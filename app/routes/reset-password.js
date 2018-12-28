/** Password reset page. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import styled from '../bind-style';
import history from '../history';
import { post } from '../requests';
import { noUser } from '../authorities';
import { Link, Button } from '../components/primitives';
import { Field, required, passwordFormat, mergeValidators } from '../components/fields';
import style from './reset-password';

/** The password reset page. */
@styled(style)
class ResetPasswordPage extends Component {
	constructor(props) {
		super(props);

		this.state = { tokenExpired: false };
	}

	@bound
	async submit() {
		let reset = this.fields.collect_();
		if (!reset) return;
		reset.reset_token = this.props.templated.token;

		try {
			await post({
				route: '/auth/password-reset',
				json: reset
			});
		}
		catch (err) {
			if (err.status != 422) throw err;

			this.setState({tokenExpired: true});
			return;
		}

		history.push('/login');
	}

	render({}, { tokenExpired }) { return (
		<div id="password-reset-page">
			{ tokenExpired ?
				<span>
					<div class="link-expired">This reset link has expired</div>
					<Link label="Request another" href="/login"/> 
				</span>
				:
				<div class="reset-area">
					<h3>Reset your password</h3>
					<Field
						parent={ this } id="password"
						type="password" label="Password"
						validator={ mergeValidators(required, passwordFormat) }
					/>
					<Field
						parent={ this } id="confirm_password"
						type="password" label="Confirm password"
						validator={ mergeValidators(required, passwordFormat) }
					/>
					<div class="reset-actions">
						<Button label="Reset password" onClick={ this.submit }/>
					</div>
				</div>
			}
		</div>
	); }
}

//	Exports.
export default { 
	title: 'Password Reset',
	authority: noUser,
	component: ResetPasswordPage 
};
