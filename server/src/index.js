// server entry point

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// health check route
app.get('/', (req, res) => {
    res.json({ message: 'EnergyFlow API is running' });
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`EnergyFlow server running on port ${PORT}`);
});