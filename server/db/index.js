const { Pool, types } = require('pg');

// Parse PostgreSQL numeric (1700) and int8 (20) as JavaScript numbers
// This prevents "value.toFixed is not a function" crashes in the React frontend
// because natively pg returns numerics as strings to prevent loss of precision.
types.setTypeParser(1700, function(val) { return parseFloat(val); });
types.setTypeParser(20, function(val) { return parseInt(val, 10); });

const connectionString = process.env.DATABASE_URL || process.env.supabaseUrl;

if (!connectionString) {
  throw new Error('Missing DATABASE_URL (or legacy supabaseUrl) in .env');
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// ── Prevent idle-client disconnects from crashing the process ───────────────
// When Supabase (or any PG server) drops an idle connection, the Pool emits
// an 'error' event.  Without a listener Node treats it as fatal and exits.
pool.on('error', (err) => {
  console.error('⚠️  Unexpected PG pool error (idle client):', err.message);
});

async function testConnection() {
  console.log("Testing connection to database...");
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log("✅ Successfully connected to Postgres on Supabase!");
    console.log("📊 Available Tables:");
    const tables = res.rows.map(row => row.table_name);
    console.table(tables.length ? tables : ["No tables found in public schema"]);
  } catch (err) {
    console.error("❌ Connection attempt failed:", err);
  }
}

exports.query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error', { text, error });
    throw error;
  }
};

exports.testConnection = testConnection;
