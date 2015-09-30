import bowser from 'ded/bowser'
import throttle from '../lib/throttle'
import isMobile from '../lib/isMobile'
import sendEvent from '../lib/event'

const types = ['collection', 'drop-off', 'vigil', 'demonstration', 'other'];

export default function Map(el, config, contributions) {
    var map, overlayPane, currentVisibleTypes = [];

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
            if (contrib.latlng[0] && icons[type]) {
                return L.circleMarker(contrib.latlng, {
                    'className': 'wm-pin wm-pin--' + type,
                    'radius': 7,
                    'stroke': false
                }).addTo(map).on('click', () => {
                    sendEvent('contribution', {'id': contributionId});
                });
            }
            return undefined;
        });

        var selectedMarker;
        window.addEventListener('contribution', evt => {
            var contrib = contributions[evt.detail.id];
            var marker = contributionMarkers[evt.detail.id];
            if (marker) {
                map.flyTo(contrib.latlng);

                if (selectedMarker) {
                    selectedMarker.setRadius(7);
                    selectedMarker.getElement().classList.remove('is-selected');
                }
                marker.setRadius(14);
                marker.getElement().classList.add('is-selected');
                marker.bringToFront();
                selectedMarker = marker;
            }
        });

        window.addEventListener('location', evt => {
            map.flyTo(evt.detail.latlng, 10);
        });

        overlayPane = map.getPane('overlayPane');

        setVisibleTypes(currentVisibleTypes);
    }

    var setVisibleTypes = this.setVisibleTypes = function (types) {
        if (overlayPane) {
            overlayPane.setAttribute('data-types', types.join(' '));
        } else {
            currentVisibleTypes = types;
        }
    };

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
