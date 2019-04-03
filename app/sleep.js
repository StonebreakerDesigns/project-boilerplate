/** Promise friendly timeouts. */

/** Sleep. */
const sleep = time => new Promise(resolve => setTimeout(resolve, time));

/** Work requeuing. */
const requeue = () => sleep(1);

//	Export.
export { sleep, requeue };
export default sleep;
