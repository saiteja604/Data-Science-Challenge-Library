const express = require('express');
const router = express.Router();
const User = require('/models/user');
const saltRounds=10;
import User from '../models/User'

// Registration route
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Optional: Hash the password before storing it
        await bcrypt.hash(password, saltRounds);// your hashing logic

            const newUser = new User({ username, password: hashedPassword });
            await newUser.save();

        // Redirect or handle the response
        res.redirect('/login'); // Redirect to login page after registration
    } catch (error) {
        console.error(error);
        // Handle errors, e.g., username already exists
        res.status(500).send('Error registering new user');
    }
});


// Login route
router.post('/login', async (req, res) => {
    // Implementation
});

module.exports = router;
