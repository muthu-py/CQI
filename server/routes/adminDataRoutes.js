const express = require('express');
const adminDataService = require('../services/adminDataService');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { label, value } = req.body || {};
    const created = await adminDataService.createData(label, value);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    const data = await adminDataService.listData();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/summary', async (_req, res, next) => {
  try {
    const summary = await adminDataService.getDataSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

