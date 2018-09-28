import { h, Component } from 'preact';
import { createContext } from 'preact-context';

const AppContext = createContext();
export default ContextDependentComponent => {
	return class extends Component {
		render() {
			return <AppContext.Consumer>
				{ context => 
					<ContextDependentComponent 
						context={ context } 
						{...this.props}
				/> }
			</AppContext.Consumer>
		}
	}
}
//	Export the context so the app can provide it.
export { AppContext }
