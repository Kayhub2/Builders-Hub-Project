let map;
let marker;

document.addEventListener('DOMContentLoaded', () => {
    map = L.map('map').setView([51.505, -0.09], 13); // Default map view

    // Tile layer (using OpenStreetMap tiles)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add traffic data markers and interactions (dummy data)
    L.circle([51.505, -0.09], { radius: 200, color: 'red' }).addTo(map); // Heavy Traffic Example
});

function setLocation() {
    const location = document.getElementById('location').value;
    const [lat, lon] = location.split(',');
    if (lat && lon) {
        map.setView([parseFloat(lat), parseFloat(lon)], 13);  // Update map center
        // Fetch traffic data for the new location
        fetchTrafficData(lat, lon);
    } else {
        alert('Invalid location');
    }
}

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

function fetchTrafficData(lat, lon) {
    axios.get(`https://api.tomtom.com/trafficServices/v1/traffic?lat=${lat}&lon=${lon}&key=YOUR_API_KEY`)
        .then(response => {
            // Add markers for traffic conditions based on response data
            // Assuming response has an array of traffic info
            console.log(response.data);
        })
        .catch(error => {
            console.error('Error fetching traffic data:', error);
        });
}

function toggleDarkMode() {
    document.getElementById('controls').classList.toggle('dark-mode');
}

function logout() {
    alert('Logging out...');
    // Add actual logout logic (e.g., clear session or token)
    window.location.href = 'index.html'; // Redirect to login page
}
