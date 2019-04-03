/** Password reset page. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import contextual from '../app-context';
import history from '../history';
import { post } from '../requests';
import { noUser } from '../auth';
import { Link, Button } from '../components/primitives';
import { 
	Field, FieldContext, required, passwordFormat, mergeValidators 
} from '../components/fields';

/** The password reset page. */
@contextual
class ResetPasswordPage extends Component {
	constructor(props) {
		super(props);

		this.state = {tokenExpired: false};
	}

	@bound
	async submit() {
		let reset = this.fields.collect_();
		if (!reset) return;

		let {context: {templated: {token}}} = this.props;
		try {
			await post({
				route: '/passwd-tokens',
				json: {...reset, reset_token: token}
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
					<div class="pad-vb">This reset link has expired</div>
					<Link label="Request another" href="/login"/> 
				</span>
				:
				<div class="col-6 al-l">
					<h3>Reset your password</h3>
					<FieldContext parent={ this }>
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
						<Button label="Reset password" onClick={ this.submit }/>
					</div>
				</div>
			}
		</div>
	); }
}

//	Exports.
export default { 
	metadata: {title: 'Reset your password', description: 'Reset your password.'},
	authCheck: noUser,
	component: ResetPasswordPage 
};
