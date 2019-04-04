/** Document metadata provision and rendering. */
import { h } from 'preact';

import config from './server-config';

//	Define the metadata schema to value key map.
const METADATA_SCHEMAS = {
	twitter: {
		valueKey: 'content',
		defaults: {
			type: 'summary',
			site: config.document.siteTwitter
		}
	},
	og: {
		valueKey: 'property',
		defaults: {
			type: 'website'
		}
	}
};

/** Render metadata into JSX under a given schema. */
const renderSchematized = (metadata) => {
	let {title, description} = metadata, nodes = [];
	
	Object.keys(METADATA_SCHEMAS).forEach(ns => {
		let schema = METADATA_SCHEMAS[ns],
			data = {title, description, ...metadata[ns], ...schema.defaults};

		nodes = nodes.concat(Object.keys(data).map(p => ((prop, value) => (
			<meta 
				name={ [ns, prop].join(':') } 
				{...{[schema.valueKey]: value}}
			/>
		))(p, data[p])));
	});

	return nodes;
};

/** Render the canonical metadata object into virtual DOM. */
const renderMetadata = metadata => {
	let {title, description} = metadata;

	return [
		<title>{ title }</title>,
		<meta name="description" content={ description }/>,
		...renderSchematized(metadata)
	];
}

export { renderMetadata };
