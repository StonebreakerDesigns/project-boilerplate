/** Canonical application errors. */

/** An exception to be raised when the current route doesn't exist. */
class NotFound {}

/** An exception to trigger redirection. */
class SeeOther {
	constructor(dest) { this.dest = dest; }
}

/** An exception triggered by a user not being authenticated. */
class Unauthorized {}

/** An exception triggered by a user not being authorized. */
class Forbidden {}

//	Exports.
export { NotFound, SeeOther, Unauthorized, Forbidden };
