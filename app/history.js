/* Server-safe history provision. */
import createHistory from 'history/createBrowserHistory';

//	Export nothing if we're not in the browser.
const history = typeof window !== 'undefined' && createHistory();
export default history;
