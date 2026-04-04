const db = require('../db');
const { computePerformance } = require('../../analysis/performance/performance');

exports.calculatePerformance = async (params) => {
  const data = {}; 
  return computePerformance(data);
};
