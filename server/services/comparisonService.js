const db = require('../db');
const { generateComparison } = require('../../analysis/comparisons/comparison');

exports.calculateComparison = async (params) => {
  const data = {};
  return generateComparison(data);
};
