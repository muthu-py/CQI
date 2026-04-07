function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password is required');
  }

  return password;
}

function verifyPassword(password, storedHash) {
  if (!password || !storedHash || typeof storedHash !== 'string') {
    return false;
  }

  return password === storedHash;
}

module.exports = {
  hashPassword,
  verifyPassword,
};
