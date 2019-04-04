/** Isomorphic-safe history provision. */
import { createBrowserHistory } from 'history';

//  Create engine.
let history = typeof window !== 'undefined' && createBrowserHistory();

/** Whether or not a link is app-external. */
const isExternalLink = href => /^http(?:s|):\/\//.test(href);

/** 
*   Return an object containing properties for a history-powered 
*   link. 
*/
const linkProps = href => {
	let external = isExternalLink(href);
	
	return {
		href,
		target: external ? '_blank' : undefined,
		onClick: event => {
			if (external) return;

			if (event) {
				event.stopPropagation();
				event.preventDefault();
			}
			history.push(href);
		}
	};
};

//  Exports.
export { linkProps, isExternalLink };
export default history;
