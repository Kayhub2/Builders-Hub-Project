const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config(); // Load environment variables

const app = express();

// CORS Configuration
const corsOptions = {
    origin: [
        'http://127.0.0.1:5500',
        'http://localhost:3000',
        'https://builders-hub-project.vercel.app' 
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/traffic_tracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// Register API
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        let user = await User.findOne({ username });

        if (user) {
            return res.status(400).json({ message: 'User already exists. Please log in.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); 
        user = new User({ username, password: hashedPassword });

        await user.save();
        res.status(201).json({ message: 'Registration successful.', user });
    } catch (error) {
        console.error('Error in /register:', error);
        res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
});

// Login API
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        res.status(200).json({ message: 'Login successful.', user });
    } catch (error) {
        console.error('Error in /login:', error);
        res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
});

// Traffic Data API
app.get('/traffic', async (req, res) => {
    const { location } = req.query;
    console.log('Requested location:', location);

    const apiKey = process.env.TOMTOM_API_KEY;
    const apiUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?key=${apiKey}&point=${location}`;

    try {
        const response = await axios.get(apiUrl);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching traffic data:', error);
        res.status(500).json({ message: 'Failed to fetch traffic data.' });
    }
});

// Route Suggestion API
app.get('/route', async (req, res) => {
    const { start, end } = req.query;
    const apiKey = process.env.TOMTOM_API_KEY;
    const apiUrl = `https://api.tomtom.com/routing/1/calculateRoute/${start}:${end}/json?key=${apiKey}`;

    try {
        const response = await axios.get(apiUrl);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching route data:', error);
        res.status(500).json({ message: 'Failed to fetch route data.' });
    }
});

// Geocoding API (new endpoint)
app.get('/geocode', async (req, res) => {
    const { query } = req.query; // Query should be the address
    const apiKey = process.env.TOMTOM_API_KEY;
    const apiUrl = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(query)}.json?key=${apiKey}`;

    try {
        const response = await axios.get(apiUrl);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching geocode data:', error);
        res.status(500).json({ message: 'Failed to fetch geocode data.' });
    }
});

// Handle preflight OPTIONS request
app.options('*', cors(corsOptions));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
