/** The server-side document representation. */
import { h } from 'preact';
import { render } from 'preact-render-to-string';

import config from './server-config';
import { StyleContext } from '../style-context';
import { App } from '../app';
import { renderMetadata } from './metadata';
import { TMInclude, TMNSInclude, UAInclude } from '../analytics';

/** An SSR'd document. */
class HTMLDocument {
	constructor(essence) { this.essence = essence; }
	
	/** 
	*   Create and return a curried function for stylesheet aggregation. 
	*/
	createStyleAggregator() {
		let set = [];
		return [
			() => set.map(s => s._getCss()).join(''), 
			sheet => set.indexOf(sheet) == -1 && set.push(sheet)
		];
	}
	
	/** Safely to-string-JSON a data object. */
	jsonify(data) {
		//	Don't allow string content to close the script tag.
		return JSON.stringify(data).replace('<', '&lt;').replace('>', '&gt;');
	}

	/** Render this document as a string. */
	render() {
		//  Hoist for fun.
		let 
			//	Set up style aggregator.
			[resolveStyles, addStyle] = this.createStyleAggregator(),
			//	Unpack and process essence.
			{ route, query, templated, component, data, metadata, user, vid } = this.essence,
			//  Alias some essence features for sanity.
			PageComponent = component, appProps = { route, query, templated, user };

		//	Render.
		return render(<html lang={ config.document.lang }>
			<head>
				{ renderMetadata(metadata) }
				<TMInclude/>
				<UAInclude vid={ vid }/>
				<link rel="icon" {...config.document.favIcon}/>
				<meta name="viewport" content="width=device-width, initial-scale=1"/>
				<script id="-data-preload" dangerouslySetInnerHTML={{__html: `
					window.data = ${ this.jsonify(data) };
					window.user = ${ this.jsonify(user) };
					window.vid = '${ vid }';
				`}}/>
			</head>
			<body>
				<TMNSInclude/>
				<div id="app-root">
					<StyleContext.Provider value={ addStyle }>
						<App {...appProps}>
							<PageComponent data={ data }/>
						</App>
					</StyleContext.Provider>
				</div>
				<script id="-app-load" charset="utf-8" src="/assets/client.js" defer/>
			</body>
		</html>).replace(
			'</head>', 
			'<style id="-ssr-styles">' + resolveStyles() + '</style></head>'
		);
	}
}

//	Export.
export { HTMLDocument };