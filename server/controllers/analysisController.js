const performanceService = require('../services/performanceService');
const coAttainmentService = require('../services/coAttainmentService');
const poAttainmentService = require('../services/poAttainmentService');
const attendanceService = require('../services/attendanceService');
const teacherService = require('../services/teacherService');
const comparisonService = require('../services/comparisonService');
const coPoMappingService = require('../services/coPoMappingService');
const adminInsightsService = require('../services/adminInsightsService');
const batchAnalysisService = require('../services/batchAnalysisService');
const analyticsService = require('../services/analyticsService');
const internalExternalService = require('../services/internalExternalService');
const ApiError = require('../errors/ApiError');

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

exports.getInternalMarks = async (req, res, next) => {
  try {
    const offeringId = Number.parseInt(req.params.offering_id, 10);
    if (Number.isNaN(offeringId)) {
      throw new ApiError(400, 'Invalid offering_id path parameter');
    }

    const data = await analyticsService.getInternalPercentages(offeringId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getExternalMarks = async (req, res, next) => {
  try {
    const offeringId = Number.parseInt(req.params.offering_id, 10);
    if (Number.isNaN(offeringId)) {
      throw new ApiError(400, 'Invalid offering_id path parameter');
    }

    const data = await analyticsService.getExternalPercentages(offeringId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /analytics/internal-external
 * Query params: subject_id, regulation_id, batch_id
 * Returns per-student internal %, external %, and gap.
 */
exports.getInternalExternalComparison = async (req, res, next) => {
  try {
    const filters = req.normalizedFilters || req.query;
    const { subject_id, regulation_id, batch_id } = filters;

    if (!subject_id || !regulation_id || !batch_id) {
      throw new ApiError(
        400,
        'Missing required query parameters: subject_id, regulation_id, batch_id'
      );
    }

    const data = await internalExternalService.getInternalExternalComparison(filters);
    res.json(data);
  } catch (error) {
    next(error);
  }
};
