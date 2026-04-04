const db = require('../db');
const { computeCoAttainment } = require('../../analysis/co_attainment/coAttainment');

exports.calculateCoAttainment = async (params) => {
  const data = {};
  return computeCoAttainment(data);
};
