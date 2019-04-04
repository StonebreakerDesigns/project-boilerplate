/** Polyfills to preact. */
import { Component, options } from 'preact';
import cx from 'classname';

//	--- Class property schema.

/** Apply our custom option. */
const applyOptionToVNode = (vn, next) => {
	let { attributes } = vn;

	if (attributes && attributes.class && typeof attributes.class == 'object') {
		attributes.class = cx(attributes.class);
	}

	if (next) next(vn);
}

//	Apply class object polyfill.
let existingOpt = options.vnode;
options.vnode = vn => applyOptionToVNode(vn, existingOpt);

//	--- State getter/setter generation.

/** This internal representation of a state key annotation. */
class _ISAnnotation {
	constructor(value, opts) {
		this.value = value;
		this.opts = opts;
	}

	get getter() { return this.opts.indexOf('g') >= 0; }
	get setter() { return this.opts.indexOf('s') >= 0; }
}

/**  
*	This function takes a state template generator as its argument, and passes
*	it a callable used to annotate state properties. For example, a component
*	could call:
*	```
*	this.buildState(a => {x: a(1, 'gs')});
*	```
*	to construct a state consisting of `x` with inital value 1, `getX`,
*	`setX`, and `setX.curry`.
*/
Component.prototype.buildState = function(templateGen) {
	//	Generate the state template.
	let template = templateGen((...args) => new _ISAnnotation(...args)),
		state = {}, me = this;
	
	//	Iterate template.
	for (let key in template) {
		let defn = template[key],
			capitalCase = key[0].toUpperCase() + key.substring(1);

		if (!(defn instanceof _ISAnnotation)) {
			//	Direct value.
			state[key] = defn;
			continue;
		}

		//	Definition.
		state[key] = defn.value;
		if (defn.setter) {
			//	Add a setter.
			let methKey = 'set' + capitalCase;

			me[methKey] = function(v) { me.setState({[key]: v}); };
			me[methKey].curry = function(...args) {
				return function() { me[methKey](...args); }
			};
		}
		if (defn.getter) {
			//	Add a getter.
			let methKey = 'get' + capitalCase;

			me[methKey] = function() { return this.state[key]; };
		}
	}
	
	this.state = state;
};
