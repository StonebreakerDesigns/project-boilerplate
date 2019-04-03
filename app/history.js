/** Isomorphic-safe history provision. */
import { createBrowserHistory } from 'history';

//	Export false if we're not in the browser.
//	eslint-disable-next-line no-undef
export default typeof window !== 'undefined' && createBrowserHistory();
