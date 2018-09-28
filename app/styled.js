/* 
*	Isomorphic component styling. Used by passing the stylesheet-imported style
*	object to the default export of this module as a higher order component of
*	the target component.
*/
import { Component, h } from 'preact';
import { createContext } from 'preact-context';

const StyleContext = createContext();
const _withStyleContext = StyleContextedComponent => {
	/* Module-internal style context access. */
	return class extends Component {
		render() {
			return <StyleContext.Consumer>
				{ addStyle => 
					<StyleContextedComponent 
						_addStyle={ addStyle } 
						{...this.props}
					/>
				}
			</StyleContext.Consumer>
		}
	}
}

export default (style, lazy=false) => {
	/* 
	*	A style-binding HOC. Specifying lazyness will cause the styles not to
	*	render on the server-side.
	*/
	return StyledComponent => {
		class StyleInjectedComponent extends Component {
			constructor(props) {
				super(props);

				//	If we're on the server and eager, register the style for
				//	render.
				if (this.props._addStyle) {
					this.props._addStyle(style);
				}
			}

			componentDidMount() {
				//	Inject style.
				this._removeCss = style._insertCss();
			}

			componentWillUnmount() {
				//	Remove style.
				this._removeCss();
			}

			render() {
				return <StyledComponent {...this.props}/>
			}
		}

		//	Export as lazy or not.
		if (lazy) return StyleInjectedComponent;
		return _withStyleContext(StyleInjectedComponent);
	}
}
//	Export the style context so client.js and server.js can provide it.
export { StyleContext }
