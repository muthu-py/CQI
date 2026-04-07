const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const validateQueryParams = require('../middleware/validateQueryParams');

router.use(validateQueryParams);

// Define API routes mapping to the controller
router.get('/performance', analysisController.getPerformance);
router.get('/co-attainment', analysisController.getCoAttainment);
router.get('/po-attainment', analysisController.getPoAttainment);
router.get('/attendance', analysisController.getAttendance);
router.get('/teacher-performance', analysisController.getTeacher);
router.get('/comparisons', analysisController.getComparison);
router.get('/co-po-mapping', analysisController.getCoPoMapping);
router.get('/admin/filter-options', analysisController.getAdminFilterOptions);
router.get('/admin/co-po-insights', analysisController.getCoPoInsights);
router.get('/batch-marks', analysisController.getBatchMarks);
router.get('/batch-attendance', analysisController.getBatchAttendance);

module.exports = router;
