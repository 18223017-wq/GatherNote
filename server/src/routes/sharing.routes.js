const express = require('express');
const router = express.Router();
const sharingController = require('../controllers/sharing.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// POST /api/v1/notes/:id/share
router.post('/:id/share', sharingController.setVisibility);

// POST /api/v1/notes/:id/collaborators
router.post('/:id/collaborators', sharingController.addCollaborator);

// GET /api/v1/notes/:id/collaborators
router.get('/:id/collaborators', sharingController.getCollaborators);

// DELETE /api/v1/notes/:id/collaborators/:collaboratorId
router.delete('/:id/collaborators/:collaboratorId', sharingController.removeCollaborator);

module.exports = router;
