/** Auth. and authz. authorities. */
import { Forbidden, Unauthorized, SeeOther } from './errors';

/** Assert no user. */
const noUser = ({ type }) => {
	if (type) throw new SeeOther('/login');
};

/** Assert any user. */
const anyUser = ({ type }) => {
	if (!type) throw new Unauthorized();
};

/** Return an authority that asserts there is a user of the given type. */
const userOfType = requiredType => ({ type }) => {
	if (type != requiredType) throw new Forbidden();
};

//	Exports.
export { noUser, anyUser, userOfType };
