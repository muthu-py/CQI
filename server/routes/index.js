const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

// Define API routes mapping to the controller
router.get('/performance', analysisController.getPerformance);
router.get('/co-attainment', analysisController.getCoAttainment);
router.get('/po-attainment', analysisController.getPoAttainment);
router.get('/attendance', analysisController.getAttendance);
router.get('/teacher', analysisController.getTeacher);
router.get('/comparison', analysisController.getComparison);

// CO-PO Mapping Endpoints
router.get('/copo/desired', analysisController.getDesiredCoPo);
router.get('/copo/achieved', analysisController.getAchievedCoPo);

module.exports = router;
