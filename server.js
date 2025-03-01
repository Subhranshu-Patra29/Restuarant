require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const path = require('path');

const app = express();
app.use(bodyParser.json());


// Configure CORS options
const corsOptions = {
    origin: '*', // Allow requests only from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
};

// Enable CORS
app.use(cors(corsOptions));

// Routes
app.use('/auth', authRoutes);
app.use('/orders', orderRoutes);

// Serve static files from the 'public' directory
app.use(express.static(path.join('./public')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
