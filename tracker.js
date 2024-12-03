let map;
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

    // Add traffic flow tiles
    const trafficFlowTiles = new tt.TrafficFlowTiles({
        key: tomtomKey,
        style: 'relative', // or 'absolute'
    });
    map.addLayer(trafficFlowTiles);

    // Add traffic incidents tiles
    const trafficIncidentsTiles = new tt.TrafficIncidentsTiles({
        key: tomtomKey,
    });
    map.addLayer(trafficIncidentsTiles);
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
        .then(response => {
            if (!response.ok) throw new Error('Geocoding request failed');
            return response.json();
        })
        .then(data => {
            if (data.results.length) {
                const pos = data.results[0].position;
                console.log('Geocoded Position:', pos); // Debug log
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
                console.log('User Location:', pos); // Debug log
                map.setCenter(pos);
                new tt.Marker().setLngLat(pos).addTo(map);
            },
            (error) => {
                console.error('Error getting geolocation:', error);
                alert('Geolocation failed. Please allow location access in your browser.');
            }
        );
    } else {
        alert('Your browser does not support geolocation.');
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Logout Functionality
function logout() {
    alert('Logged out successfully!');
    window.location.href = 'index.html';
}

// Initialize the map
window.onload = initMap;
