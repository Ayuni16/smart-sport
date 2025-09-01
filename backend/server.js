const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

// --- Routes Import Section ---
const sportRoutes = require('./Routes/sportRoutes');
const sponsorshipRoutes = require('./Routes/sponsorshipRoutes');
const memberRoutes = require('./Routes/memberRoutes');
const playerRoutes = require('./Routes/playerRoutes'); 
// .env file  load 
dotenv.config();

// Express app 
const app = express();

// Middlewares 
app.use(cors());
app.use(express.json());

// --- Routes Usage Section ---
app.use('/api/members', memberRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/sponsorships', sponsorshipRoutes);
app.use('/api/players', playerRoutes); 

// Database connect 
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('connected MongoDB !');
        // DB connection 
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT} !`)); 
    })
    .catch((err) => {
        console.log("Database connection error:", err); 
    });