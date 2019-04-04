/** Auth. and authz. authorities. */
import { Forbidden, Unauthorized } from './errors';

/** Assert no user. */
const noUser = user => {
	if (user) throw new Forbidden();
};

/** Assert any user. */
const anyUser = user => {
	if (!user) throw new Unauthorized();
};

/** Return an authority that asserts there is a user of the given type. */
const userOfType = requiredType => user => {
	if (!user) throw new Unauthorized();
	if (user.type != requiredType) throw new Forbidden();
};

//	Exports.
export { noUser, anyUser, userOfType };
