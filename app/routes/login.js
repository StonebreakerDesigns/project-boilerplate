/** Login page. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import config from '../config';
import contextual from '../app-context';
import history from '../history';
import { noUser } from '../auth';
import { post } from '../requests';
import { Button } from '../components/primitives';
import { 
	Field, FieldContext, required, passwordFormat, emailFormat, mergeValidators
} from '../components/fields';

/** The login page. */
@contextual
class LoginPage extends Component {
	constructor(props) {
		super(props);

		this.buildState(a => ({
			error: a(null, 's'), 
			reseting: a(false, 's')
		}));
	}

	/** Submit a password reset request. */
	async submitResetRequest() {
		try {
			await post({
				route: '/passwd-tokens',
				jsonSource: this
			});
		}
		catch (err) {
			if (err.isFormInvalidation) return;
			throw err;
		}

		this.setReseting(false);
	}

	/** Submit login credentials. */
	async submitCredentials() {
		try {
			await post({
				route: '/auth',
				jsonSource: this
			});
		}
		catch (err) {
			if (err.isFormInvalidation) return;
			if (err.status != 401) throw err;

			this.setError(err.json.message);
			return;
		}

		let {context: {fetchAuth, query: { r }}} = this.props;
		await fetchAuth();
		history.push(r || config.behaviour.postAuthDest);
	}

	@bound
	submit() {
		let { reseting } = this.state;

		if (reseting) this.submitResetRequest();
		else this.submitCredentials();
	}

	render({}, { error, reseting }) { return (
		<div id="login-page" class="al-c">
			{ !reseting ?
				<div class="col-6 al-l">
					<h2 class="pad-vb">Log in</h2>
					<FieldContext parent={ this } error={ error }>
						<Field
							id="email_address"
							label="Email address"
							validator={ mergeValidators(required, emailFormat) }
						/>
						<Field
							id="password"
							type="password" label="Password"
							validator={ mergeValidators(required, passwordFormat) }
						/>
					</FieldContext>
					<div class="al-r">
						<Button label="Sign in" onClick={ this.submit }/>
					</div>
					<div class="al-r pad-vt">
						<Button 
							label="Forgot your password?" class="simple" 
							onClick={ this.setReseting.curry(true) }
						/>
					</div>
				</div>
				:
				<div class="col-6 al-l">
					<h3 class="pad-vb">Request password reset</h3>
					<p class="pad-vb">
						Enter your email address and we'll send you a reset
						link.
					</p>
					<div>
						<Field
							parent={ this } id="email"
							label="you@yours.com"
							validator={ mergeValidators(required, emailFormat) }
						/>
					</div>
					<div class="al-r">
						<Button label="Send reset link" onClick={ this.submit }/>
					</div>
					<div class="al-r pad-vt">
						<Button 
							label="Cancel" class="simple"
							onClick={ this.setReseting.curry(false) }
						/>
					</div>
				</div>
			}
		</div>
	); }
}

//	Export.
export default {
	metadata: {
		title: 'Log in',
		description: 'Log in to access your account.'
	},
	authCheck: noUser,
	component: LoginPage
};