const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const analysisRoutes = require('./routes/index');
const authRoutes = require('./routes/authRoutes');
const adminDataRoutes = require('./routes/adminDataRoutes');
const authenticateAdmin = require('./middleware/authenticateAdmin');
const { bootstrapAuthStorage } = require('./services/adminAuthService');
const errorHandler = require('./middleware/errorHandler');
const db = require('./db');

let attendanceMetricsRoutes = null;
try {
  attendanceMetricsRoutes = require('./modules/attendanceMetrics/attendanceMetricsRoutes');
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') {
    throw error;
  }
  console.warn(
    'attendanceMetricsRoutes not loaded: ./modules/attendanceMetrics/attendanceMetricsRoutes is missing'
  );
}

// ── Prevent unhandled rejections / exceptions from crashing the process ──────
process.on('unhandledRejection', (reason, promise) => {
  console.error('[unhandledRejection]', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/analysis', authenticateAdmin, analysisRoutes);
if (attendanceMetricsRoutes) {
  app.use('/analysis/attendance-metrics', authenticateAdmin, attendanceMetricsRoutes);
}
app.use('/admin/data', authenticateAdmin, adminDataRoutes);
app.use('/analytics', authenticateAdmin, analysisRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const RUN_DB_STARTUP_CHECK = process.env.DB_STARTUP_CHECK === 'true';
const RUN_AUTH_BOOTSTRAP = process.env.AUTH_BOOTSTRAP === 'true';
let server = null;
let keepAliveTimer = null;
let isShuttingDown = false;

function stopKeepAliveTimer() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Received ${signal}. Closing HTTP server...`);
  stopKeepAliveTimer();

  if (!server || !server.listening) {
    process.exit(0);
    return;
  }

  server.close((err) => {
    if (err && err.code !== 'ERR_SERVER_NOT_RUNNING') {
      console.error('Error while closing server:', err);
      process.exitCode = 1;
    }
    process.exit();
  });
}

function startServer() {
  if (server) return Promise.resolve(server);

  server = app.listen(PORT, () => {
    console.log(`CQI Analytics Engine is running on port ${PORT}`);
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  // Defensive keepalive for environments that reap the main process when no
  // foreground stdio activity is detected, even though the HTTP server is up.
  keepAliveTimer = setInterval(() => {}, 60000);

  if (RUN_AUTH_BOOTSTRAP) {
    bootstrapAuthStorage().catch((err) => {
      console.error('Admin auth bootstrap failed:', err);
    });
  }

  if (RUN_DB_STARTUP_CHECK) {
    db.testConnection().catch((err) => {
      console.error('Database startup check failed:', err);
    });
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGHUP', () => shutdown('SIGHUP'));

  return Promise.resolve(server);
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Server startup failed:', error);
    process.exit(1);
  });
}

module.exports = { app, startServer };
