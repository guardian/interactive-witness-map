import doT from 'olado/doT'
import share from '../lib/share'
import madlib from '../lib/madlib'
import scrollTo from '../lib/scrollTo'
import sendEvent from '../lib/event'
import geocode from '../lib/geocode'

import template from './templates/user.html!text'

const types = ['collection', 'drop-off', 'vigil', 'demonstration', 'other'];

var templateFn = doT.template(template);

var shareFn = share('Interactive title', 'http://gu.com/p/URL', '#Interactive');

export default function User(el, contributions, onTypeChange) {
    var $$ = s => [].slice.apply(el.querySelectorAll(s));

    el.innerHTML = templateFn({contributions, types});

    madlib(el.querySelector('.js-location'), loc => {
        geocode(loc, (err, resp) => {
            if (!err) {
                var center = resp.features[0].center;
                sendEvent('location', {'latlng': [center[1], center[0]]});
            }
        });
    });

    var contributionsEl = el.querySelector('.js-contributions');
    contributionsEl.classList.add('type--all');

    var enabledTypes = [];
    $$('.js-type').forEach(typeEl => {
        var type = typeEl.getAttribute('data-type');
        typeEl.addEventListener('click', () => {
            var index = enabledTypes.indexOf(type);
            if (index !== -1) {
                enabledTypes.splice(index, 1);
            } else {
                enabledTypes.push(type);
            }
            contributionsEl.classList.toggle(`type--${type}`, index === -1);
            contributionsEl.classList.toggle('type--all', enabledTypes.length === 0);

            onTypeChange(enabledTypes);
        });
    });

    var contributionEls = $$('.js-contribution');
    contributionEls.forEach((contributionEl, contributionId) => {
        contributionEl.addEventListener('click', () => sendEvent('contribution', {'id': contributionId}));
    });

    var currentContributionEl;
    window.addEventListener('contribution', evt => {
        var contributionEl = contributionEls[evt.detail.id];
        if (currentContributionEl && currentContributionEl !== contributionEl) {
            currentContributionEl.classList.remove('is-selected');
        }

        scrollTo(contributionsEl.scrollTop, contributionEl.offsetTop,
            y => contributionsEl.scrollTop = y);

        currentContributionEl = contributionEl;
        contributionEl.classList.add('is-selected');
    });

    $$('.interactive-share').forEach(shareEl => {
        var network = shareEl.getAttribute('data-network');
        shareEl.addEventListener('click',() => shareFn(network));
    });

    if ('geolocation' in navigator) {
        let userLocationEl = el.querySelector('.js-gps');
        userLocationEl.style.display = 'block';
        userLocationEl.addEventListener('click', () => {
            userLocationEl.removeAttribute('data-has-error');
            userLocationEl.setAttribute('data-is-loading', '');

            navigator.geolocation.getCurrentPosition(function (position) {
                showPosition([position.coords.latitude, position.coords.longitude], () => {
                    userLocationEl.removeAttribute('data-is-loading');
                });
            }, function (err) {
                console.log(err);
                userLocationEl.removeAttribute('data-is-loading');
                userLocationEl.addAttribute('data-has-error', '');
            });

            userLocationEl.blur();
        });
    }
}
