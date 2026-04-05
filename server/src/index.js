const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = express();
const { connectDatabase } = require('./database/database');

dotenv.config();
const PORT = process.env.PORT || 5000;

(async () => {
    await connectDatabase();
})();

// Middleware
app.use(express.json());

app.get('/check',(req,res) => {
    res.send('Server is running on port 5000');
    console.log('Server is running on port 5000');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});