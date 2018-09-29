/**
*	The application context allows components to interact with fundamental,
*	DOM-contextual functionality such as flashing messages.
*/
import { h, Component } from 'preact';
import { createContext } from 'preact-context';

//	Create the context.
const AppContext = createContext();
/**
*	An HOC decorator that provides context access via `props.context` to its
*	child components.
*/
const contextual = ContextDependentComponent => {
	// eslint-disable-next-line react/display-name
	return class extends Component {
		render() { return (
			<AppContext.Consumer>
				{ context => 
					<ContextDependentComponent 
						context={ context } 
						{...this.props}
					/> 
				}
			</AppContext.Consumer>
		); }
	};
};

//	Exports.
export default contextual;
export { AppContext };
