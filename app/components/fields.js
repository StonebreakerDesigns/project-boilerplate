/** Form fields. */
import { Component, h } from 'preact';
import { createContext } from 'preact-context';
import bound from 'autobind-decorator';

import styled from '../style-context';
import style from './fields.less';

//	Create field context.
const FieldContextBase = createContext();

/** An HOC for field context subscription. */
const _ctxConsumer = Dependent => (
	class extends Component {
		render(props) { return (
			<FieldContextBase.Consumer>{ ctx => (
				<Dependent 
					parent={ ctx && ctx.parent } 
					clearFormError={ ctx && ctx.clearFormError }
					{...props}
				/>
			) }</FieldContextBase.Consumer>
		) }
	}
)

/** On-component storage for child fields. */
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

/** A field. */
@_ctxConsumer
@styled(style)
class Field extends Component {
	constructor(props) {
		super(props);

		this.node = null;

		this.state = {value: props.value || '', error: null};
	}

	componentDidMount() {
		let { id, parent } = this.props;
		//	Maybe be the first to set up the field store.
		if (!('fields' in parent)) parent.fields = new FieldStore();
		//	Attach self to field store.
		parent.fields._addField(id, this);
	}

	componentWillUnmount() {
		let { id, parent } = this.props;
		//	Detatch self from field store.
		parent.fields._removeField(id);
	}

	/** The field value, with type intellegence. */
	get value() {
		let { type } = this.props,
			{ value } = this.state;

		if (type == 'number') {
			if (value === null) return null;
			return +value;
		}
		else return value;
	}

	/** Value setter. */
	set value(value) {
		this.setState({ value });
	}

	/** Handle an input event on key up. */
	@bound
	handleInput(event) {
		let { parent, validator, clearFormError } = this.props;
		if (event.keyCode == 13) {
			if (parent.submit) parent.submit();
			return;
		}
		let { value } = this.node, error = null;

		//	Clear form error from context if we're in one.
		if (clearFormError) clearFormError();

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
		<div class={ ['field', props.class, {error}] }>
			{ label && <label for={ id }>{ label }</label> }
			<input
				ref={ n => this.node = n } id={ id } 
				type={ type || 'text' } placeholder={ placeholder }
				name={ id } 
				value={ value } onKeyUp={ this.handleInput }
			/>
			{ error && <div class="error-text">{ error }</div> }
		</div>
	); }
}

/** 
*	A context into which fields can be placed that globalizes `parent` in its 
*	children an can optionally manage a FormError.
*/
class FieldContext extends Component {
	constructor(props) {
		super(props);

		this.lastExternalError = null;

		this.buildState(a => ({
			error: a(props.error, 's')
		}));
	}

	componentDidUpdate() {
		let { error } = this.props;
		if (error != this.lastExternalError) {
			this.lastExternalError = error;
			this.setError(error);
		}
	}

	render({ parent, children }, { error }) { return (
		<span>
			{ (typeof error !== 'undefined') && <FormError error={ error }/> }
			<FieldContextBase.Provider value={{ 
				parent, clearFormError: this.setError.curry(null)
			}}>
				{ children }
			</FieldContextBase.Provider>
		</span>
	); }
}


//	Define base validators which return false if input is validated
//	and an error description otherwise.

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
	FormError, Field, FieldContext, required, regexValidator, emailFormat,
	passwordFormat, mergeValidators
};
