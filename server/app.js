require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analysisRoutes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');


const path = require('path');
const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Routes
app.use('/analysis', analysisRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CQI Analytics Engine is running on port ${PORT}`);
});
