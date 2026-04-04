require('dotenv').config();
const express = require('express');
const analysisRoutes = require('./routes/index');


const path = require('path');
const app = express();
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/analysis', analysisRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CQI Analytics Engine is running on port ${PORT}`);
});
