/** The primary application context */
import { h, Component } from 'preact';
import { createContext } from 'preact-context';

//	Create the context.
const AppContext = createContext();

/** Context subscription HOC */
const contextual = ContextDependentComponent => {
	// eslint-disable-next-line react/display-name
	return class extends Component {
		render(props) { return (
			<AppContext.Consumer>{ context => 
				<ContextDependentComponent 
					context={ context } {...props}
				/> 
			}</AppContext.Consumer>
		); }
	};
};

//	Exports.
export default contextual;
export { AppContext };
