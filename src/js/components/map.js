import bowser from 'ded/bowser'
import throttle from '../lib/throttle'
import isMobile from '../lib/isMobile'
import sendEvent from '../lib/event'

const types = ['collection', 'drop-off', 'vigil', 'demonstration', 'other'];

export default function Map(el, config, contributions) {
    var map, markerPane;
    var currentVisibleTypes = [], currentLatLng;

    function init(L) {
        var icons = {};
        types.forEach(type => {
            icons[type] = L.icon({
                'iconUrl': `${config.assetPath}/assets/imgs/pin-${type}.png`,
                'iconSize': [25, 31],
                'iconAnchor': [13, 31],
                'className': `wm-pin wm-pin--${type}`
            });
        });

        map = L.map(el, {
            'zoom': 6,
            'minZoom': 4,
            'maxZoom': 14,
            'center': [54.01422, -0.09887],
            'zoomControl': false
        });

        // Leaflet's retina test
        var retina =
            (window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1 ? '@2x' : '';

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}{retina}.png?access_token={accessToken}', {
            'id': 'guardian.10dec3bb',
            'accessToken': 'pk.eyJ1IjoiZ3VhcmRpYW4iLCJhIjoiNHk1bnF4OCJ9.25tK75EuDdgq5GxQKyD6Fg',
            'retina': retina
        }).addTo(map);

        var contributionMarkers = contributions.map((contrib, contributionId) => {
            var type = contrib.types[0] || 'other';
            // TODO: support icons[type]
            if (!isNaN(contrib.latlng[0]) && icons[type]) {
                var marker = L.marker(contrib.latlng, {'icon': icons[type]}).addTo(map);
                marker.on('click', () => {
                    sendEvent('contribution', {'id': contributionId});
                });
                return marker;
            }
            return undefined;
        });

        window.addEventListener('contribution', evt => {
            var contrib = contributions[evt.detail.id];
            if (!isNaN(contrib.latlng[0])) {
                var type = contrib.types[0] || 'other';
                var marker = L.marker(contrib.latlng, {'pane': 'popupPane', 'icon': icons[type]}).addTo(map);
                markerPane.classList.add('has-selected');
                console.log(contributionMarkers[evt.detail.id]);
            }
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

    var script = document.createElement('script');
    script.src = config.assetPath + '/assets/leaflet.js';
    script.onload = () => init(window.L);
    document.body.appendChild(script);
}
