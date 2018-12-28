/** Promise friendly timeouts. */

/** Async/await sleep. */
const sleep = time => new Promise(resolve => setTimeout(resolve, time));

//	Export.
export default sleep;