// server entry point

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const energyRoutes = require('./routes/energyRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://energyflow-client.onrender.com'
  ],
  credentials: true,
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/reports', reportRoutes);

// health check route
app.get('/', (req, res) => {
    res.json({ message: 'EnergyFlow API is running' });
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`EnergyFlow server running on port ${PORT}`);
});