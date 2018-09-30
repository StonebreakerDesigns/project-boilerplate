/** Password reset page. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import history from '../history';
import contextual from '../app-context';
import { post } from '../request';
import { deauthenticate } from '../auth';
import { Link, Button } from '../components/primitives';
import { 
	Field, RequiredPasswordValidator, collectFields
} from '../components/fields';

/** The password reset page. */
@contextual
@deauthenticate
class ResetPasswordPage extends Component {
	constructor(props) {
		super(props);

		this.passwordValidator = new RequiredPasswordValidator();

		this.state = {
			tokenExpired: false
		};
	}

	componentWillMount() {
		if (!this.props.context.query.r) {
			//	Invalid link.
			history.push('/not-found');
		}
	}

	@bound
	async submit() {
		let reset = collectFields(this, {
			password: 'password',
			confirmPassword: 'confirm_password'
		});
		if (!reset) return;
		reset.reset_token = this.props.context.query.r;

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

		this.props.context.flashMessage('Your password has been reset.');
		history.push('/login');
	}

	render({}, { tokenExpired }) { return (
		<div id="password-reset-page" class="al-center">
			{ tokenExpired ?
				<span>
					<em class="pad-vb">This reset link has expired</em>
					<br/>
					<Link label="Request another" href="/login"/> 
				</span>
				:
				<div class="col-4 max-4h component">
					<h3>Reset your password</h3>
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
						<Button label="Reset password" onClick={ this.submit }/>
					</div>
				</div>
			}
		</div>
	); }
}

//	Exports.
export default { 
	title: 'Reset your password',
	component: ResetPasswordPage 
};
