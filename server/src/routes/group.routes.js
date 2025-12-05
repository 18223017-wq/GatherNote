const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// POST /api/v1/groups
router.post('/', groupController.createGroup);

// POST /api/v1/groups/join
router.post('/join', groupController.joinGroup);

// GET /api/v1/groups
router.get('/', groupController.getGroups);

// GET /api/v1/groups/:id
router.get('/:id', groupController.getGroupById);

// DELETE /api/v1/groups/:id/members/:userId
router.delete('/:id/members/:userId', groupController.removeMember);

module.exports = router;
