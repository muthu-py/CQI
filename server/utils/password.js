const crypto = require('crypto');

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, keylen: 64 };

function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password is required');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, SCRYPT_PARAMS.keylen, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
  });

  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password, storedHash) {
  if (!password || !storedHash || typeof storedHash !== 'string') {
    return false;
  }

  const [algo, salt, expectedHex] = storedHash.split(':');
  if (algo !== 'scrypt' || !salt || !expectedHex) {
    return false;
  }

  const actual = crypto.scryptSync(password, salt, expectedHex.length / 2, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
  });
  const expected = Buffer.from(expectedHex, 'hex');

  if (actual.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(actual, expected);
}

module.exports = {
  hashPassword,
  verifyPassword,
};

