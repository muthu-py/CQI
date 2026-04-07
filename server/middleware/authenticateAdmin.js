const ApiError = require('../errors/ApiError');
const { verifyJwt } = require('../utils/jwt');
const { HARD_JWT_SECRET } = require('../config/adminAuthConfig');
const { getInvalidBeforeEpochSeconds } = require('../services/adminAuthService');

async function authenticateAdmin(req, _res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Missing or invalid Authorization header'));
  }

  const secret = process.env.JWT_SECRET || HARD_JWT_SECRET;

  const payload = verifyJwt(token, secret);
  if (!payload || payload.role !== 'admin') {
    return next(new ApiError(401, 'Invalid or expired token'));
  }

  const issuedAt = Number(payload.iat) || 0;
  const invalidBefore = await getInvalidBeforeEpochSeconds();
  if (issuedAt <= invalidBefore) {
    return next(new ApiError(401, 'Token has been signed out. Please login again.'));
  }

  req.admin = {
    id: payload.sub,
    username: payload.username,
    role: payload.role,
  };

  return next();
}

module.exports = authenticateAdmin;
