const db = require('../db');
const ApiError = require('../errors/ApiError');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signJwt } = require('../utils/jwt');
const {
  HARD_ADMIN_USERNAME,
  HARD_ADMIN_PASSWORD,
  HARD_JWT_SECRET,
  DEFAULT_TOKEN_TTL_SECONDS,
} = require('../config/adminAuthConfig');

async function bootstrapAuthStorage() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      singleton BOOLEAN NOT NULL DEFAULT TRUE UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS admin_private_data (
      id SERIAL PRIMARY KEY,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS admin_auth_state (
      singleton BOOLEAN NOT NULL DEFAULT TRUE UNIQUE,
      invalid_before TIMESTAMPTZ NOT NULL DEFAULT TO_TIMESTAMP(0)
    )
  `);

  const username = HARD_ADMIN_USERNAME;
  const password = HARD_ADMIN_PASSWORD;

  const passwordHash = hashPassword(password);
  await db.query(`
    DELETE FROM admin_users;
  `);
  await db.query('INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)', [
    username,
    passwordHash,
  ]);
  await db.query(`
    INSERT INTO admin_auth_state (invalid_before)
    VALUES (TO_TIMESTAMP(0))
    ON CONFLICT (singleton) DO NOTHING
  `);
  console.log(`Seeded hardcoded admin user "${username}"`);
}

async function loginAdmin(username, password) {
  if (!username || !password) {
    throw new ApiError(400, 'username and password are required');
  }

  const result = await db.query(
    'SELECT id, username, password_hash FROM admin_users WHERE username = $1 LIMIT 1',
    [username]
  );

  if (result.rows.length === 0) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const admin = result.rows[0];
  const valid = verifyPassword(password, admin.password_hash);
  if (!valid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const secret = process.env.JWT_SECRET || HARD_JWT_SECRET;
  const ttl = Number(process.env.JWT_EXPIRES_IN_SECONDS || DEFAULT_TOKEN_TTL_SECONDS);
  const token = signJwt(
    {
      sub: String(admin.id),
      username: admin.username,
      role: 'admin',
    },
    secret,
    Number.isFinite(ttl) && ttl > 0 ? ttl : DEFAULT_TOKEN_TTL_SECONDS
  );

  return {
    token,
    tokenType: 'Bearer',
    expiresInSeconds: Number.isFinite(ttl) && ttl > 0 ? ttl : DEFAULT_TOKEN_TTL_SECONDS,
  };
}

async function signoutAdmin() {
  await db.query(`
    INSERT INTO admin_auth_state (singleton, invalid_before)
    VALUES (TRUE, NOW())
    ON CONFLICT (singleton)
    DO UPDATE SET invalid_before = EXCLUDED.invalid_before
  `);
}

async function getInvalidBeforeEpochSeconds() {
  const result = await db.query(
    `
      SELECT EXTRACT(EPOCH FROM invalid_before)::BIGINT AS invalid_before_epoch
      FROM admin_auth_state
      WHERE singleton = TRUE
      LIMIT 1
    `
  );

  if (result.rows.length === 0) {
    return 0;
  }

  return Number(result.rows[0].invalid_before_epoch) || 0;
}

module.exports = {
  bootstrapAuthStorage,
  loginAdmin,
  signoutAdmin,
  getInvalidBeforeEpochSeconds,
};
