/** The client-side & generally application global configuration exposure. */
import { client, common } from '../config/app.config.json';
export default { ...client, ...common };
