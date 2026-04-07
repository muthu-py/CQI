const db = require('../db');
const ApiError = require('../errors/ApiError');

async function createData(label, value) {
  if (!label || !value) {
    throw new ApiError(400, 'label and value are required');
  }

  const result = await db.query(
    `
      INSERT INTO admin_private_data (label, value)
      VALUES ($1, $2)
      RETURNING id, label, value, created_at, updated_at
    `,
    [label, value]
  );
  return result.rows[0];
}

async function listData() {
  const result = await db.query(
    `
      SELECT id, label, value, created_at, updated_at
      FROM admin_private_data
      ORDER BY created_at DESC
    `
  );
  return result.rows;
}

async function getDataSummary() {
  const result = await db.query(
    `
      SELECT
        COUNT(*)::INT AS total_records,
        MAX(created_at) AS latest_record_at
      FROM admin_private_data
    `
  );

  return result.rows[0];
}

module.exports = {
  createData,
  listData,
  getDataSummary,
};

