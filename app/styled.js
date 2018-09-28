import { Component, h } from 'preact';
import { createContext } from 'preact-context';

//	TODO: Refactor.

const StyleContext = createContext();
const withStyleContext = StyleContextedComponent => {
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

export default style => {
	return StyledComponent => {
		return withStyleContext(class extends Component {
			constructor(props) {
				super(props);

				if (this.props._addStyle) {
					this.props._addStyle(style);
				}
			}

			componentDidMount() {
				this._removeCss = style._insertCss();
			}

			componentWillUnmount() {
				this._removeCss();
			}

			render() {
				return <StyledComponent {...this.props}/>
			}
		});
	}
}
export { StyleContext }