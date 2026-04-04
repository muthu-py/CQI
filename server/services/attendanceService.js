const db = require('../db');
const { computeAttendance } = require('../../analysis/attendance/attendance');

exports.calculateAttendance = async (params) => {
  const data = {};
  return computeAttendance(data);
};
