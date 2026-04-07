const express = require('express');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const { loginAdmin, signoutAdmin } = require('../services/adminAuthService');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    const result = await loginAdmin(username, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/signout', authenticateAdmin, async (_req, res, next) => {
  try {
    await signoutAdmin();
    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticateAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;
