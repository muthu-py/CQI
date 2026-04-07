const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.supabaseUrl || process.env.DATABASE_URL
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

// Automatically test connection when db is required
testConnection();

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
