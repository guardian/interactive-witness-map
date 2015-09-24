import share from '../lib/share'

import template from './templates/user.html!text'

var shareFn = share('Interactive title', 'http://gu.com/p/URL', '#Interactive');

export default function user(el) {
    el.innerHTML = template;

    [].slice.apply(el.querySelectorAll('.interactive-share')).forEach(shareEl => {
        var network = shareEl.getAttribute('data-network');
        shareEl.addEventListener('click',() => shareFn(network));
    });
}
