import bowser from 'ded/bowser'
import throttle from '../lib/throttle'
import isMobile from '../lib/isMobile'

const types = ['collection', 'drop-off', 'vigil', 'demonstration', 'other'];

export default function Map(el, config, contributions) {
    var map, markerPane;
    var currentVisibleTypes = [], currentLatLng;

    function init(L) {
        L.mapbox.accessToken = 'pk.eyJ1IjoiZ3VhcmRpYW4iLCJhIjoiNHk1bnF4OCJ9.25tK75EuDdgq5GxQKyD6Fg';

        var icons = {};
        types.forEach(type => {
            icons[type] = L.icon({
                'iconUrl': `${config.assetPath}/assets/imgs/pin-${type}.png`,
                'iconSize': [30, 55],
                'iconAnchor': [15, 55],
                'className': `wm-pin wm-pin--${type}`
            });
        });

        map = L.mapbox.map(el, 'guardian.10dec3bb', {
            'zoom': 6,
            'center': [54.01422, -0.09887],
            'zoomControl': false
        });
        window.map = map;

        contributions.filter(contrib => !isNaN(contrib.latlng[0])).forEach(contrib => {
            var type = contrib.types[0] || 'other';
            L.marker(contrib.latlng, {'icon': icons[type]}).addTo(map);
        });

        markerPane = map.getPanes().markerPane;

        setVisibleTypes(currentVisibleTypes);
        if (currentLatLng) setLatLng(currentLatLng);
    }

    var setVisibleTypes = this.setVisibleTypes = function (types) {
        if (markerPane) {
            markerPane.setAttribute('data-types', types.join(' '));
        } else {
            currentVisibleTypes = types;
        }
    };

    var setLatLng = this.setLatLng = function (latlng) {
        if (map) {
            // TOOD: zoom to latlng
        } else {
            currentLatLng = latlng;
        }
    }

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

    var script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox.js/v2.2.2/mapbox.js';
    script.onload = () => init(window.L);
    document.body.appendChild(script);
}
