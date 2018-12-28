/** Isomorphic component styling. */
import { Component, h } from 'preact';
import { createContext } from 'preact-context';

//	Create style context.
const StyleContext = createContext();

/** Module-internal style context access. */
const _withStyleContext = StyleContextedComponent => {
	//	eslint-disable-next-line react/display-name
	return class extends Component {
		render() { return (
			<StyleContext.Consumer>
				{ addStyle => 
					<StyleContextedComponent 
						_addStyle={ addStyle } 
						{...this.props}
					/>
				}
			</StyleContext.Consumer>
		); }
	};
};

/** A style-binding HOC. */
const styled = style => {
	return StyledComponent => (
		//	eslint-disable-next-line react/display-name
		_withStyleContext(class extends Component {
			constructor(props) {
				super(props);

				//	If we're on the server register the style for render.
				let { _addStyle } = this.props;
				if (_addStyle) _addStyle(style);
			}

			componentDidMount() {
				//	Inject style.
				this._removeCss = style._insertCss();
			}

			componentWillUnmount() {
				//	Remove style.
				this._removeCss();
			}

			render() { return (
				<StyledComponent {...this.props}/>
			); }
		})
	);
};

//	Exports.
export default styled;
export { StyleContext };
