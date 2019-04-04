/** Analytics architecture and provision. */
import { Component, h } from 'preact';
import { createContext } from 'preact-context';
import bound from 'autobind-decorator';

import contextual from './app-context';
import logger from './log';
import config from './config';

//  Alias config.
const 
    TM_KEY = config.googleAnalytics.tagManagerAPIKey,
    UA_KEY = config.googleAnalytics.uaAPIKey;
//	Create logger.
let log = logger('analytics');
//	Create context.
const AnalyticsContextBase = createContext();

/**
*	An HOC that adds the inner component to the analytics context stack.
*/
const analyticsScope = scopeVal => InnerComponent => {
	//	eslint-disable-next-line react/display-name
	return (class extends Component {
		render(props) { return (
			<AnalyticsContextBase.Consumer>{ ctx => (
				<AnalyticsContext.Provider value={ [...(ctx || []), scopeVal] }>
					<InnerComponent {...props}/>
				</AnalyticsContext.Provider>
			) }</AnalyticsContextBase.Consumer>
		); }
	});
};

/** Analytics dispatch generator mechanism. */
const _makeDispatcher = category => ({ action, label, value }) => {
	log.debug('dispatch', category, action, label, value);
	window.ga('send', 'event', {
		eventCategory: category,
		eventAction: action,
		eventLabel: label,
		eventValue: value
	});
};

/** 
*	HOC that allows a component to dispatch contextual analytics events.
*/
const dispatches = InnerComponent => {
	/** The immediate HOC. */
	@contextual
	class DispatchingHOC extends Component {
		/** Dispatch a contextual analytics event. */
		@bound
		dispatch({target, ...args}) {
			let { _analyticsCtx } = this.props,
				category = [..._analyticsCtx];
			if (target) category.push(target);

			_makeDispatcher(category.join('>'))(args);
		}

		/** Create a child dispatcher. */
		@bound
		makeDispatcher(targetExt) {
			let { _analyticsCtx } = this.props,
				category = [..._analyticsCtx, targetExt];
			
			return _makeDispatcher(category.join('>'));
		}

		render(props) { return (
			<InnerComponent 
				{...props} 
				dispatch={ this.dispatch }
				makeDispatcher={ this.makeDispatcher }
			/>
		); }
	}

	//	eslint-disable-next-line react/display-name
	return (class extends Component {
		render(props) { return (
			<AnalyticsContextBase.Consumer>{ ctx => (
				<DispatchingHOC {...props} _analyticsCtx={ ctx || [] }/>
			) }</AnalyticsContextBase.Consumer>
		); }
	});
};

/** Google tag manager include. */
class TMInclude extends Component {
	render() { return TM_KEY && (
		<script id="--tm"> {`
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${ TM_KEY }');
		`} </script>
	); }
}

/** Google tag manager noscript include. */
class TMNSInclude extends Component {
	render() { return TM_KEY && (<noscript id="-tm-ns">
        <iframe 
            src={ 
                'https://www.googletagmanager.com/ns.html?id=' + TM_KEY
            }
            height="0" width="0" style="display:none;visibility:hidden"
        />
	</noscript>); }
}

/** Google UA include. */
class UAInclude extends Component {
	render({ vid }) { return UA_KEY && (
		<script id="--ua"> {`
window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
ga('create', {
	trackingId: '${ UA_KEY }',
	cookieDomain: 'auto',
	userId: '${ vid }'
});

let s = document.createElement('script')
s.setAttribute('src', 'https://www.google-analytics.com/analytics.js');
s.setAttribute('async', true);
document.getElementsByTagName('head')[0].insertBefore(s, document.getElementById('--ua'));
		`}</script>
	); }
}

//  Exports.
export {
	TMInclude, TMNSInclude, UAInclude, dispatches, analyticsScope
};
