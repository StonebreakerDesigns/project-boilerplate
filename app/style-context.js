/** Isomorphic component styling. */
import { Component, h } from 'preact';
import { createContext } from 'preact-context';

import logger from './log';

//	Create a logger.
const log = logger('styles');

//	Create style context.
const StyleContext = createContext();

/** Module-internal style context access. */
const _withStyleContext = Dependent => {
	//	eslint-disable-next-line react/display-name
	return class extends Component {
		render(props) { return (
			<StyleContext.Consumer>{ addStyle => (
				<Dependent 
					_addStyle={ addStyle } 
					{...props}
				/>
			) }</StyleContext.Consumer>
		); }
	};
};

/** A style-binding HOC. */
const styled = style => {
	return Dependent => (
		//	eslint-disable-next-line react/display-name
		_withStyleContext(class extends Component {
			constructor(props) {
				super(props);

				//	Register the style on the server.
				let { _addStyle } = this.props;
				if (_addStyle) _addStyle(style);
				else log.warn('no binding mechanism!');
			}

			componentDidMount() {
				//	Inject style on the client.
				this._removeCss = style._insertCss();
			}

			componentWillUnmount() {
				//	Remove style.
				this._removeCss();
			}

			render(props) { return (
				<Dependent {...props}/>
			); }
		})
	);
};

//	Exports.
export default styled;
export { StyleContext };
