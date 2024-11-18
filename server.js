const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // Add bcrypt for password hashing

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/traffic_tracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// Search Schema
const searchSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    searches: [String],
});
const Search = mongoose.model('Search', searchSchema);
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    let user = await User.findOne({ username });

    if (!user) {
        // If the user doesn't exist, register a new user
        user = new User({ username, password });
        await user.save();
        res.status(200).send({ message: 'Registration successful', user });
    } else {
        // If user exists, check if passwords match
        if (user.password === password) {
            res.status(200).send({ message: 'Login successful', user });
        } else {
            res.status(400).send({ message: 'Invalid password' });
        }
    }
});

// Login API
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });

        if (!user) {
            // Register a new user if they don't exist
            user = new User({ username, password });
            await user.save();
            res.status(200).send({ message: 'Registration successful', user });
        } else {
            // User exists, validate the password
            if (user.password === password) {
                res.status(200).send({ message: 'Login successful', user });
            } else {
                res.status(401).send({ message: 'Invalid username or password' });
            }
        }
    } catch (error) {
        console.error('Error in /register:', error);
        res.status(500).send({ message: 'An error occurred. Please try again.' });
    }
});


// Save Search API
app.post('/save-search', async (req, res) => {
    const { userId, search } = req.body;

    let userSearch = await Search.findOne({ userId });
    if (!userSearch) {
        userSearch = new Search({ userId, searches: [search] });
    } else {
        userSearch.searches.push(search);
    }

    await userSearch.save();
    res.status(200).send({ message: 'Search saved successfully', searches: userSearch.searches });
});

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
