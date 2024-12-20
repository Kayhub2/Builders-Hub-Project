let map;
let marker;

document.addEventListener('DOMContentLoaded', () => {
    map = L.map('map').setView([51.505, -0.09], 13); // Default map view

    // Tile layer (using TomTom tiles)
    L.tileLayer('https://{s}.api.tomtom.com/map/1/tile/basic/{z}/{x}/{y}.png?key=AhGkbtIXQ6QyUbnrpvYDSyrErQWnD8W5', {
        attribution: '&copy; <a href="https://www.tomtom.com">TomTom</a>'
    }).addTo(map);

    // Add a default traffic marker (heavy traffic example)
    L.circle([51.505, -0.09], { radius: 200, color: 'red' }).addTo(map); // Heavy Traffic Example
});

// Set location based on input
function setLocation() {
    const location = document.getElementById('location').value;
    const [lat, lon] = location.split(',');
    if (lat && lon) {
        map.setView([parseFloat(lat), parseFloat(lon)], 13);  // Update map center
        // Fetch traffic data for the new location
        fetchTrafficData(lat, lon);
    } else {
        alert('Invalid location. Please enter latitude and longitude.');
    }
}

// Use the user's geolocation
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 13);  // Center map on user location
            // Fetch traffic data for user location
            fetchTrafficData(latitude, longitude);
        }, () => {
            alert('Geolocation not supported or denied.');
        });
    } else {
        alert('Geolocation not supported.');
    }
}

// Fetch traffic data from TomTom's Traffic API
function fetchTrafficData(lat, lon) {
    const apiKey = 'AhGkbtIXQ6QyUbnrpvYDSyrErQWnD8W5'; // Replace with your TomTom API key
    const url = `https://api.tomtom.com/trafficServices/v1/incidentDetails?lat=${lat}&lon=${lon}&key=${apiKey}`;

    axios.get(url)
        .then(response => {
            // Assuming response contains an array of traffic incidents
            const trafficData = response.data;
            console.log(trafficData);

            // Remove any previous markers before adding new ones
            map.eachLayer(layer => {
                if (layer instanceof L.Circle) {
                    map.removeLayer(layer);
                }
            });

            // Add markers based on traffic data
            if (trafficData && trafficData.incidents) {
                trafficData.incidents.forEach(incident => {
                    const { lat, lon, severity } = incident;
                    let color = 'green'; // Default low traffic

                    // Change marker color based on severity
                    if (severity === 'HIGH') {
                        color = 'red'; // Heavy traffic
                    } else if (severity === 'MODERATE') {
                        color = 'orange'; // Moderate traffic
                    }

                    // Add a circle marker for the traffic incident
                    L.circle([lat, lon], { radius: 100, color: color }).addTo(map)
                        .bindPopup(`<b>Traffic Incident</b><br>Severity: ${severity}`);
                });
            } else {
                console.log('No traffic incidents found for this location.');
            }
        })
        .catch(error => {
            console.error('Error fetching traffic data:', error);
        });
}

// Toggle dark mode for controls panel
function toggleDarkMode() {
    document.getElementById('controls').classList.toggle('dark-mode');
}

// Simulate logout functionality
function logout() {
    alert('Logging out...');
    // Add actual logout logic (e.g., clear session or token)
    window.location.href = 'index.html'; // Redirect to login page
}
