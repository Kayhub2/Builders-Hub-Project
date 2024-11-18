let map;
let trafficFlowLayer;
let trafficIncidentsLayer;
const tomtomKey = 'CUpygEvKtS0IWBc06QJawQldwhJE0PXw'; // Replace with your TomTom API Key

// Initialize the map
function initMap() {
    const defaultLocation = { lat: 6.1517, lng: 6.7857 }; // Onitsha, Nigeria
    map = tt.map({
        key: tomtomKey,
        container: 'map',
        center: defaultLocation,
        zoom: 12,
    });

    // Add traffic layers
    trafficFlowLayer = tt.TrafficFlowLayer({ key: tomtomKey });
    trafficIncidentsLayer = tt.TrafficIncidentsLayer({ key: tomtomKey });
    map.addLayer(trafficFlowLayer);
    map.addLayer(trafficIncidentsLayer);
}

// Set location based on user input
function setLocation() {
    const location = document.getElementById('location').value;
    if (!location) {
        alert('Please enter a location.');
        return;
    }
    geocodeLocation(location);
}

// Geocode location
function geocodeLocation(location) {
    const geocodeUrl = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(location)}.json?key=${tomtomKey}`;
    fetch(geocodeUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results.length) {
                const pos = data.results[0].position;
                map.setCenter([pos.lon, pos.lat]);
                new tt.Marker().setLngLat([pos.lon, pos.lat]).addTo(map);
            } else {
                alert('Location not found.');
            }
        })
        .catch(err => console.error('Error in geocoding:', err));
}

// Use user's current location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = [position.coords.longitude, position.coords.latitude];
                map.setCenter(pos);
                new tt.Marker().setLngLat(pos).addTo(map);
            },
            () => alert('Geolocation failed.')
        );
    } else {
        alert('Your browser does not support geolocation.');
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Refresh traffic layers
setInterval(() => {
    trafficFlowLayer.refresh();
    trafficIncidentsLayer.refresh();
}, 300000); // 5 minutes

// Logout Functionality
function logout() {
    alert('Logged out successfully!');
    window.location.href = 'index.html';
}

// Initialize the map
window.onload = initMap;
