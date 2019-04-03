/** Client-side request provision. */
import config from './config';

/** An error raised when JSON source doesn't validate for collection. */
class SourceInvalidated {
	constructor() {
		//	A property for easy identification of this error class.
		this.isFormInvalidation = true;
	}
}

/**
*	Asynchronously send an HTTP request.
*	@param options Request configuration.
*	@param options.route The target endpoint route.
*	@param options.method The request method. Each method has a member function
*		attached to this object for ease of use.
*	@param options.expect The expected response status code.
*	@param options.header An object containing request headers.
*	@param options.json A JSON-serializable payload to send with the request.
*	@param options.form An object containing data to send with the request as 
*		`multipart/form-data`.
*/
const request = async options => {
	return new Promise((resolve, reject) => {
		if (!options.route || !options.method) {
			reject(new Error('Route or method not specified'));
		}
		//	Route onto API.
		if (!options.external) {
			options.route = config.env.apiURL + options.route;
		}

		//	Maybe collect json.
		if (options.jsonSource) {
			options.json = options.jsonSource.fields.collect_();
			if (!options.json) {
				reject(new SourceInvalidated());
				return;
			}
		}

		//	Compute the status code to expect.
		let expect = options.expect || 200;
		
		//	Setup headers and body.
		let headers = options.headers || {},
			body = '';
		if (options.json) {
			headers['Content-Type'] = 'application/json';
			body = JSON.stringify(options.json);
		}
		else if (options.form) {
			headers['Content-Type'] = 'multipart/form-data';

			//	Create form data.
			body = new FormData();
			for (let key in options.form) {
				let item = options.form[key],
					blob = new Blob([item.data], {type: item.mimetype});

				//	Add to form.
				body.append(key, blob, item.filename);
			}
		}

		//	Create the XHR.
		let xhr = new XMLHttpRequest();
		//	Setup callbacks.
		xhr.addEventListener('load', () => {
			if (xhr.status !== expect) {
				let error = {
					status: xhr.status,
					json: JSON.parse(xhr.response)
				};
				reject(error);
			}

			resolve(JSON.parse(xhr.response));
		});
		xhr.addEventListener('error', () => {
			reject(new Error(xhr.statusText));
		});
		//	Send.
		xhr.open(options.method, options.route);
		for (let key in headers) {
			xhr.setRequestHeader(key, headers[key]);
		}
		xhr.send(body);
	});
};

/** Create a shorthand variant for a given request method. */
const createVariant = method => {
	return async options => {
		if (typeof options == 'string') {
			options = {route: options};
		}
		options.method = method;
		return request(options);
	};
};
//	Create variants.
let get = createVariant('GET'),
	post = createVariant('POST'),
	put = createVariant('PUT'),
	delete_ = createVariant('DELETE'),
	merge = createVariant('MERGE');

//	Export.
export default request;
export { get, post, put, delete_, merge, SourceInvalidated };
