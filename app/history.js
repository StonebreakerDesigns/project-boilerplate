/** Isomorphic-safe history provision. */
import createHistory from 'history/createBrowserHistory';

//	Export false if we're not in the browser.
//	eslint-disable-next-line no-undef
export default typeof window !== 'undefined' && createHistory();
