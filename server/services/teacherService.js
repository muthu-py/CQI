const db = require('../db');
const { computeTeacherPerformance } = require('../../analysis/teacher/teacher');

exports.calculateTeacherPerformance = async (params) => {
  const data = {};
  return computeTeacherPerformance(data);
};
