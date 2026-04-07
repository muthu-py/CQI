const ApiError = require('../errors/ApiError');
const { hasInvalidNumericFilters, normalizeFilters } = require('../utils/filterUtils');

const validateQueryParams = (req, _res, next) => {
  try {
    const invalid = hasInvalidNumericFilters(req.query);
    if (invalid.length) {
      const details = invalid.map((entry) => `${entry.key}=${entry.value}`).join(', ');
      throw new ApiError(400, 'Invalid numeric query parameter(s)', details);
    }

    req.normalizedFilters = normalizeFilters(req.query);
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = validateQueryParams;
