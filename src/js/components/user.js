import doT from 'olado/doT'
import share from '../lib/share'
import madlib from '../lib/madlib'

import template from './templates/user.html!text'

const types = ['collection', 'drop-off', 'vigil', 'demonstration', 'other'];

var templateFn = doT.template(template);
var shareFn = share('Interactive title', 'http://gu.com/p/URL', '#Interactive');

export default function User(el, contributions, onTypeChange) {
    el.innerHTML = templateFn({contributions, types});

    madlib(el.querySelector('.js-location'), () => true, v => v, v => v, () => {});

    var enabledTypes = [];
    [].slice.apply(el.querySelectorAll('.js-type')).forEach(typeEl => {
        var type = typeEl.getAttribute('data-type');
        typeEl.addEventListener('click', () => {
            var index = enabledTypes.indexOf(type);
            if (index !== -1) {
                enabledTypes.splice(index, 1);
            } else {
                enabledTypes.push(type);
            }
            onTypeChange(enabledTypes);
        });
    });

    [].slice.apply(el.querySelectorAll('.interactive-share')).forEach(shareEl => {
        var network = shareEl.getAttribute('data-network');
        shareEl.addEventListener('click',() => shareFn(network));
    });
}
