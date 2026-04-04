const performanceService = require('../services/performanceService');
const coAttainmentService = require('../services/coAttainmentService');
const poAttainmentService = require('../services/poAttainmentService');
const attendanceService = require('../services/attendanceService');
const teacherService = require('../services/teacherService');
const comparisonService = require('../services/comparisonService');

exports.getPerformance = async (req, res) => {
  try {
    const data = await performanceService.calculatePerformance(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCoAttainment = async (req, res) => {
  try {
    const data = await coAttainmentService.calculateCoAttainment(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPoAttainment = async (req, res) => {
  try {
    const data = await poAttainmentService.calculatePoAttainment(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const data = await attendanceService.calculateAttendance(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTeacher = async (req, res) => {
  try {
    const data = await teacherService.calculateTeacherPerformance(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getComparison = async (req, res) => {
  try {
    const data = await comparisonService.calculateComparison(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDesiredCoPo = async (req, res) => {
  try {
    const data = await poAttainmentService.fetchDesiredCoPo(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAchievedCoPo = async (req, res) => {
  try {
    const data = await poAttainmentService.fetchAchievedQuestionCoPo(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
