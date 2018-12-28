/** Form fields. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import styled from '../bind-style';
import style from './fields.less';

/** A on-component storage for child fields. */
class FieldStore {
	constructor() {
		this._fieldSet = [];
	}

	/** Register a field (module protected). */
	_addField(key, field) {
		this._fieldSet.push(key);
		this[key] = field;
	}

	/** Unregister a field (module protected). */
	_removeField(key) {
		this._fieldSet = this._fieldSet.filter(k => k != key);
		delete this[key];
	}

	/** The only exposed property for collecting fields. */
	collect_(opts) {
		let exclude = opts && opts.exclude, 
			toCollect = this._fieldSet.filter(
				k => (!exclude) || (exclude.indexOf(k) >= 0)
			);

		let result = {}, failed = false;
		toCollect.forEach(key => {
			if (!this[key].validateStrict()) {
				failed = true;
				return;
			}

			result[key] = this[key].value;
		});

		if (failed) return false;
		return result;
	}
}

/** A generic form error. */
@styled(style)
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

		this.input = null;
		this.state = { value: props.value || '', error: null };
	}

	componentDidMount() {
		let { id, parent } = this.props;
		if (!('fields' in parent)) {
			parent.fields = new FieldStore();
		}
		parent.fields._addField(id, this);
	}

	componentWillUnmount() {
		let { id, parent } = this.props;
		parent.fields._removeField(id);
	}

	/** The field value. */
	get value() {
		let { type } = this.props, { value } = this.state;

		if (type == 'number') {
			if (value === null) return null;
			return +value;
		}
		return value; 
	}
	/** Set the value. */
	set value(newValue) {
		this.setState({value: newValue});
	}

	/** Handle an input event. */
	@bound
	handleInput(event) {
		let { parent, validator } = this.props;
		if (event.keyCode == 13) {
			if (parent.submit) parent.submit();
			return;
		}
		let { value } = this.input, error = null;

		//	Validate.
		if (validator) error = validator(value, false);
		//	Maybe inform parent.
		if (parent.fieldChanged) parent.fieldChanged(this);

		//	Update.
		this.setState({ value, error });
	}

	/** Strictly validate this field. */
	validateStrict() {
		let { validator } = this.props;
		if (!validator) return true;
		
		let error = validator(this.state.value, true);
		this.setState({ error });
		return !error;
	}

	/** Invalidate this field with the given error. */
	invalidate(error) {
		this.setState({ error });
	}

	render({ id, label, type, placeholder, ...props }, { value, error }) { return (
		<div class={
			'field ' + (props.class || '') + ' ' +  (error ? ' error' : '')
		}>
			{ label && <label for={ id }>{ label }</label> }
			<input
				id={ id } 
				ref={ i => this.input = i }
				type={ type || 'text' } 
				placeholder={ placeholder } 
				value={ value } 
				onKeyUp={ this.handleInput }
			/>
			{ error && <div class="error-text">{ error }</div> }
		</div>
	); }
}

//	Define base validators.
/** The singleton required validator. */
const required = (value, strict=false) => strict && !value && 'Required';

/** Create regex validator. */
const regexValidator = (regex, error='Invalid format') => (
	value => value && !regex.test(value) && error
);

/** An email address validator. */
const emailFormat = regexValidator(
	/[\w.-]+@[-\w]+(?:\.[-\w]+)+/, 'Invalid email address format'
);

/** A password validator. */
const passwordFormat = regexValidator(/.{8,}/, 'Too short');

/** A validator combinator. */
const mergeValidators = (...validators) => (value, strict=false) => (
	validators.map(fn => fn(value, strict)).filter(err => err)[0] || null
);

//	Exports.
export { 
	FormError, Field, required, regexValidator, emailFormat,
	passwordFormat, mergeValidators
};
