/** Local JSON storage. */

/** Storage interface generator. */
const createStorage = backend => {
	return new (class {
		/** Return the value for key or `null`. */
		get(key) {
			return JSON.parse(backend.getItem(key) || 'null');
		}

		/** Return whether the given key is stored. */
		has(key) {
			return !!backend.getItem(key);
		}

		/** Storage the given key value pair. */
		set(key, value) {
			backend.setItem(key, JSON.stringify(value));
		}
	});
};

//	Export false on the server.
export default typeof window !== 'undefined' && createStorage(localStorage);
