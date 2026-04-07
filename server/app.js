const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const analysisRoutes = require('./routes/index');
const attendanceMetricsRoutes = require('./modules/attendanceMetrics/attendanceMetricsRoutes');
const authRoutes = require('./routes/authRoutes');
const adminDataRoutes = require('./routes/adminDataRoutes');
const authenticateAdmin = require('./middleware/authenticateAdmin');
const { bootstrapAuthStorage } = require('./services/adminAuthService');
const errorHandler = require('./middleware/errorHandler');


const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/analysis', authenticateAdmin, analysisRoutes);
app.use('/analysis/attendance-metrics', authenticateAdmin, attendanceMetricsRoutes);
app.use('/admin/data', authenticateAdmin, adminDataRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

bootstrapAuthStorage()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`CQI Analytics Engine is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Server startup failed:', error);
    process.exit(1);
  });

module.exports = app;
