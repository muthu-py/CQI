const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const analysisRoutes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const db = require('./db');

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
app.use('/analysis', analysisRoutes);
app.use('/analytics', analysisRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const RUN_DB_STARTUP_CHECK = process.env.DB_STARTUP_CHECK === 'true';
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
  if (server) return server;

  server = app.listen(PORT, () => {
    console.log(`CQI Analytics Engine is running on port ${PORT}`);
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  // Defensive keepalive for environments that reap the main process when no
  // foreground stdio activity is detected, even though the HTTP server is up.
  keepAliveTimer = setInterval(() => {}, 60000);

  if (RUN_DB_STARTUP_CHECK) {
    db.testConnection().catch((err) => {
      console.error('Database startup check failed:', err);
    });
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGHUP', () => shutdown('SIGHUP'));

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
