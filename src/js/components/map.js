import bowser from 'ded/bowser'
import throttle from '../lib/throttle'
import isMobile from '../lib/isMobile'
import sendEvent from '../lib/event'

const types = ['collection', 'drop-off', 'vigil', 'demonstration', 'other'];

export default function Map(el, config, contributions) {
    var map, overlayPane, currentVisibleTypes = [];

    function init(L) {
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
            if (!contrib.latlng[0]) return undefined;

            var markers = contrib.types.map(type => {
                return L.circleMarker(contrib.latlng, {
                    'className': 'wm-pin wm-pin--' + type,
                    'radius': 7,
                    'color': 'white',
                    'weight': 1
                });
            });

            return L.featureGroup(markers).addTo(map).on('click', () => {
                sendEvent('contribution', {'id': contributionId});
            });
        });

        var selectedMarker;
        window.addEventListener('contribution', evt => {
            var contrib = contributions[evt.detail.id];
            var marker = contributionMarkers[evt.detail.id];
            if (marker) {
                map.flyTo(contrib.latlng);

                if (selectedMarker) {
                    selectedMarker.setStyle({'radius': 7, 'color': 'white', 'weight': 1});
                }
                marker.setStyle({'radius': 14, 'color': '#333', 'weight': 1.5});
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
