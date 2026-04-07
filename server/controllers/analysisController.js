const performanceService = require('../services/performanceService');
const coAttainmentService = require('../services/coAttainmentService');
const poAttainmentService = require('../services/poAttainmentService');
const attendanceService = require('../services/attendanceService');
const teacherService = require('../services/teacherService');
const comparisonService = require('../services/comparisonService');
const coPoMappingService = require('../services/coPoMappingService');
const adminInsightsService = require('../services/adminInsightsService');
const batchAnalysisService = require('../services/batchAnalysisService');

exports.getPerformance = async (req, res, next) => {
  try {
    const data = await performanceService.calculatePerformance(req.normalizedFilters || req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getCoAttainment = async (req, res, next) => {
  try {
    const data = await coAttainmentService.calculateCoAttainment(req.normalizedFilters || req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getPoAttainment = async (req, res, next) => {
  try {
    const data = await poAttainmentService.calculatePoAttainment(req.normalizedFilters || req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getAttendance = async (req, res, next) => {
  try {
    const data = await attendanceService.calculateAttendance(req.normalizedFilters || req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getTeacher = async (req, res, next) => {
  try {
    const data = await teacherService.calculateTeacherPerformance(req.normalizedFilters || req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getTeacherInsights = async (req, res, next) => {
  try {
    const data = await teacherService.getTeacherPerformanceInsights(req.normalizedFilters || req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getComparison = async (req, res, next) => {
  try {
    const data = await comparisonService.calculateComparison(req.normalizedFilters || req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getCoPoMapping = async (req, res, next) => {
  try {
    const data = await coPoMappingService.getSubjectCoPoMappings(req.normalizedFilters || req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getAdminFilterOptions = async (req, res, next) => {
  try {
    const data = await adminInsightsService.getFilterOptions(req.normalizedFilters || req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getCoPoInsights = async (req, res, next) => {
  try {
    const data = await adminInsightsService.getCoPoInsights(req.normalizedFilters || req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getBatchMarks = async (req, res, next) => {
  try {
    const data = await batchAnalysisService.getBatchMarksAnalysis(req.normalizedFilters || req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getBatchAttendance = async (req, res, next) => {
  try {
    const data = await batchAnalysisService.getBatchAttendanceAnalysis(req.normalizedFilters || req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};
