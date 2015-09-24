import reqwest from 'reqwest'

import map from './components/map'
import user from './components/user'

import mainHTML from './templates/main.html!text'

const contentURL = 'https://interactive.guim.co.uk/docsdata-test/1f8nQa19Q0VMveMuPnfDFYBfh5IKRkP8APm5cLsyvXNk.json';

function app(el, config, resp) {
    map(el.querySelector('.wm-map'));
}

export function init(el, context, config, mediator) {
    el.innerHTML = mainHTML;
    user(el.querySelector('.wm-user'));

    reqwest({
        url: contentURL,
        type: 'json',
        crossOrigin: true,
        success: resp => app(el, config, resp)
    });

}
