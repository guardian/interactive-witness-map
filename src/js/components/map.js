import bowser from 'ded/bowser'
import throttle from '../lib/throttle'
import isMobile from '../lib/isMobile'

function init(el, L) {
    L.mapbox.accessToken = 'pk.eyJ1IjoiZ3VhcmRpYW4iLCJhIjoiNHk1bnF4OCJ9.25tK75EuDdgq5GxQKyD6Fg';

    var map = L.mapbox.map(el, 'guardian.lpneb1fp');
}

export default function map(el) {
    // Stop resizing from showing address bar/keyboard but allow from hiding address bar
    var lastWidth, lastHeight = 0;
    function setContainerSize() {
        if (!bowser.mobile || window.innerWidth !== lastWidth || lastHeight < window.innerHeight) {
            lastWidth = window.innerWidth;
            lastHeight = window.innerHeight;
            el.style.height = (window.innerHeight - (isMobile() ? 0 : 48)) + 'px';
        }
    }
    window.addEventListener('resize', throttle(setContainerSize, 100));
    setContainerSize();

    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', 'https://api.mapbox.com/mapbox.js/v2.2.2/mapbox.css');
    document.querySelector('head').appendChild(link);
    link.onload = () => console.log('loaded');

    var script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox.js/v2.2.2/mapbox.js';
    script.onload = () => init(el, window.L);
    document.body.appendChild(script);
}
