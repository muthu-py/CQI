require('dotenv').config({ path: './.env' });
const db = require('./server/db');

async function getCreds() {
  try {
    const res = await db.query('SELECT * FROM admin_users');
    console.log('Admin Users Table:', res.rows);
  } catch (err) {
    console.error('Error fetching creds:', err);
  } finally {
    process.exit();
  }
}

getCreds();
