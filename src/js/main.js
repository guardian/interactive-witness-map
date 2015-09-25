import reqwest from 'reqwest'

import User from './components/user'
import Map from './components/map'

import mainHTML from './templates/main.html!text'

// Polyfills
import './lib/classList'

const contentURL = 'https://interactive.guim.co.uk/docsdata-test/1f8nQa19Q0VMveMuPnfDFYBfh5IKRkP8APm5cLsyvXNk.json';

export function init(el, context, config, mediator) {
    el.innerHTML = mainHTML;

    reqwest({
        url: contentURL,
        type: 'json',
        crossOrigin: true,
        success: resp => {
            resp.sheets.contributions.forEach(contribution => {
                contribution.types = contribution.types.split(',');
                if (contribution.other) contribution.types.push('other');
                contribution.latlng = [parseFloat(contribution.latitude), parseFloat(contribution.longitude)];
            });

            app(resp.sheets.contributions);
        }
    });

    function app(contributions) {
        // TODO: show contributions
        var map = new Map(el.querySelector('.js-map'), config, contributions);
        var user = new User(el.querySelector('.js-user'), contributions, map.setVisibleTypes);
    }
}
