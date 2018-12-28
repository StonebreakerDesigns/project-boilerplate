/** Signup page. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import history from '../history';
import styled from '../bind-style';
import contextual from '../bind-context';
import { post } from '../requests';
import { noUser } from '../authorities';
import { Button } from '../components/primitives';
import {
	Field, FormError, required, passwordFormat, emailFormat, mergeValidators
} from '../components/fields';
import style from './signup.less';

/** The signup page. */
@contextual
@styled(style)
class SignupPage extends Component {
	constructor(props) {
		super(props);

		this.state = { error: null };
	}

	@bound
	async submit() {
		let info = this.fields.collect_();
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
	
	render({}, { error }) { return (
		<div id="signup-page">
			<div class="signup-area">
				<h2>Sign up</h2>
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
				<Field
					parent={ this } id="confirm_password"
					type="password" label="Confirm password"
					validator={ mergeValidators(required, passwordFormat) }
				/>
				<div class="signup-actions">
					<Button label="Sign up" onClick={ this.submit }/>
				</div>
			</div>
		</div>
	); }
}

//	Export.
export default {
	title: 'Sign Up',
	authority: noUser,
	component: SignupPage
};
