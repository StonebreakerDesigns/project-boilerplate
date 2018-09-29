/** Form fields. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import styled from '../style-context';
import style from './fields.less';

/** A field-agnostic form error. */
class FormError extends Component {
	render({ error }) { return (
		error && <div class="form-error">{ error }</div>
	); }
}

/** A form field. Parent components must have a `submit` method. */
@styled(style)
class Field extends Component {
	/**
	*	@param props Field configuration properties. 
	*	@param props.id The field ID. The field will attach itself to the 
	*		parent form with the property `id + 'Field'`.
	*	@param props.parent The parent component.
	*	@param props.type The field type.
	*	@param props.variant A class variant.
	*	@param props.placeholder The placeholder value.
	*	@param props.label The content of the label tag.
	*	@param props.value (Optional) An initial value.
	*	@param props.validator (Optional) A subclass of `Validator`.
	*/
	constructor(props) {
		super(props);

		//	Will be populated with the input element.
		this.input = null;
		this.state = {
			//	The current value.
			value: props.value || '', 
			//	The current validation error.
			validationError: null
		};
	}

	componentWillMount() {
		//	Bind to parent.
		if (!('fields' in this.props.parent)) {
			this.props.parent.fields = {};
		}
		this.props.parent.fields[this.props.id] = this;
	}

	/** The field value. */
	get value() { 
		/* The current value of this field. */
		if (this.props.type == 'number') {
			if (this.state.value === null) return null;
			return +this.state.value;
		}
		return this.state.value; 
	}
	//	eslint-disable-next-line require-jsdoc-except/require-jsdoc
	set value(newValue) { this.setState({value: newValue}); }

	/** Handle a key raise event. */
	@bound
	handleKeyUp(event) {
		if (event.keyCode == 13) {
			this.props.parent.submit();
			return;
		}

		let value = this.input.value;
		let validationError = null;
		if (this.props.validator) { 
			validationError = this.props.validator.validate(value, false);
		}
		this.setState({ value, validationError });
		
		//	Maybe inform parent.
		if (this.props.parent.childFieldChanged) {
			this.props.parent.childFieldChanged(this);
		}
	}

	/** Strictly validate this field, to see if the value is submit-ready. */
	validateStrict() {
		if (!this.props.validator) return true;
		
		let validationError = this.props.validator.validate(
			this.state.value, true
		);
		this.setState({ validationError });
		return !validationError;
	}

	/** Invalidate this field with the given error. */
	invalidate(validationError) {
		this.setState({validationError: validationError});
	}

	render(
		{ id, label, type, placeholder, container, variant }, 
		{ value, validationError }
	) {
		const baseClass = (
			'field ' + (variant || '') + ' ' + (container || '') + 
			(validationError ? ' validation-error' : '')
		);
		
		return (
			<div class={ baseClass }>
				<label htmlFor={ id }>{ label }</label>
				<input
					id={ id } 
					ref={ i => this.input = i }
					name="__unlabeled"
					type={ type } 
					placeholder={ placeholder } 
					value={ value } 
					onKeyUp={ this.handleKeyUp }
				/>
				{ validationError && <div class="validation-error-desc">
					{ validationError }
				</div> }
			</div>
		);
	}
}

//	Define validation API.
/** A validator for validation fields. Has a single method, `validate`. */
class Validator {
	/** 
	*	Validate a value. If `strict` is false, the user is currently entering 
	*	the value. Return an error description if validation fails, or a falsey 
	*	value if there is not error.
	*/
	validate(value, strict=false) { // eslint-disable-line no-unused-vars
		throw new Error('Not implemented');
	}
}

/** A field completion validator. */
class RequiredValidator {
	validate(value, strict=false) {
		return strict && value == '' && 'Required';
	}
}
/** A validator for required email addresses. */
class RequiredEmailValidator {
	validate(value, strict=false) {
		if (value == '') {
			return strict && 'Required';
		}
		//	eslint-disable-next-line no-useless-escape
		if (!/[\w\.\-]+@[\-\w]+(?:\.[\-\w]+)+/.test(value)) {
			return 'Invalid email address format';
		}

		return false;
	}
}
/** 
* A validator for required password field. Must correspond with the one on 
* the server, if good user experience is a requirement. 
*/
class RequiredPasswordValidator {
	validate(value, strict=false) {
		if (value == '') {
			return strict && 'Required';
		}
		//	eslint-disable-next-line no-useless-escape
		if (!/.{8,}/.test(value)) {
			return 'Must be 8 or more characters';
		}

		return false;
	}
}

//	Define helpers.
/** 
*	Collect a set of fields from the given parent into a JSON payload, given 
*	a `fieldMap` of field IDs to JSON keys.
*/
const collectFields = (parent, fieldMap) => {
	let result = {},
		failed = false;

	for (let key in fieldMap) {
		if (!parent.fields[key].validateStrict()) {
			failed = true;
			continue;
		}

		result[fieldMap[key]] = parent.fields[key].value;
	}

	if (failed) return false;
	return result;
};

//	Exports.
export default Field;
export { 
	FormError, Field, Validator, RequiredValidator, RequiredEmailValidator,
	RequiredPasswordValidator, collectFields
};
