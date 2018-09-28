import { h } from 'preact';
import { createContext } from 'preact-context';

const AppContext = createContext();
const withContext = Component => {
	return class extends Component {
		render() {
			return <AppContext.Consumer>
				{ context => <Component context={ context } {...this.props}/> }
			</AppContext.Consumer>
		}
	}
}

export { AppContext, withContext }
