const express = require('express');
const db = require('../config/db');
const router = express.Router();
require('dotenv').config(); 

const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


router.post('/place-order', async (req, res) => {
    var { name, phone, email, order_amount, order_items, pincode } = req.body;
    phone = "+91" + phone;

    try {
        // Insert order into the database
        const query = `
            INSERT INTO orders (name, phone, email, order_amount, order_items, pincode)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [name, phone, email, order_amount, JSON.stringify(order_items), pincode];

        await db.promise().query(query, params);

        // Generate a unique order ID (e.g., timestamp-based or UUID)
        const orderId = `ORDER${Date.now()}`;

        // Send SMS to the user
        const msg = `Hi ${name}, your order (ID: ${orderId}) has been placed successfully! The total amount is ₹${order_amount}. Thank you for ordering with शाही Rasoii.`;
        await client.messages
            .create({
                body: msg,
                from: '+14259529590',
                to: phone
            });

        res.status(201).send('Order placed successfully.');
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).send('Internal server error.');
    }
});

module.exports = router;
