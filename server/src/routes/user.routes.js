const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// GET /api/v1/users/me
router.get('/me', authenticateToken, userController.getProfile);

// PUT /api/v1/users/me
router.put('/me', authenticateToken, userController.updateProfile);

module.exports = router;
