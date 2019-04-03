/** Server only configuration. */
import { common, server } from '../../config/app.config.json';
import secrets from '../../config/app-secrets.config.json';

let config = { ...common, ...server, secrets };

console.log('Loaded app server config:', JSON.stringify(config, null, 4));

export default config;