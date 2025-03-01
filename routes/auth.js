const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');

router.post('/register', async (req, res) => {
    const { fullName, username, email, password } = req.body;

    try {
        // Check if the user already exists
        const [existingUser] = await db.promise().query('SELECT * FROM traditional_login_users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).send('Email already registered.');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user into the database
        await db.promise().query(
            'INSERT INTO traditional_login_users (name, username, email, password, provider) VALUES (?, ?, ?, ?, ?)',
            [fullName, username, email, hashedPassword, 'local']
        );

        res.status(201).send('User registered successfully.');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Internal server error.');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    // console.log(req.body);
    try {
        const [user] = await db.promise().query('SELECT * FROM traditional_login_users WHERE email = ? or username = ?', [email, email]);
        if (user.length === 0) {
            return res.status(404).send('User not found.');
        }

        // Compare the password
        console.log(user[0].password);
        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            return res.status(401).send('Invalid credentials.');
        }

        // Generate JWT for session management
        const token = jwt.sign({ id: user[0].id }, 'SECRET_KEY', { expiresIn: '1h' });
        res.json({ token, message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Internal server error.');
    }
});

router.post('/social-login', async (req, res) => {
    const { email, name, social_id, provider } = req.body;
    // console.log(req.body);
    try {
        // Check if the user already exists
        const [existingUser] = await db.promise().query('SELECT * FROM social_login_users WHERE email = ?', [email]);

        if (existingUser.length > 0) {
            // User already exists, no need to insert
            return res.status(200).send('User logged in successfully.');
        }

        // Insert new user into the database
        await db.promise().query(
            'INSERT INTO social_login_users (name, email, username, social_id, provider) VALUES (?, ?, ?, ?, ?)',
            [name, email, name, social_id, provider]
        );

        res.status(201).send('User registered successfully.');
    } catch (error) {
        console.error('Error during social login:', error);
        res.status(500).send('Internal server error.');
    }
});

module.exports = router;