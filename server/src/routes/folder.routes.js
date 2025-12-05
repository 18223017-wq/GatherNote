const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folder.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// POST /api/v1/folders
router.post('/', folderController.createFolder);

// GET /api/v1/folders
router.get('/', folderController.getFolders);

// GET /api/v1/folders/:id
router.get('/:id', folderController.getFolderById);

// PUT /api/v1/folders/:id
router.put('/:id', folderController.updateFolder);

// DELETE /api/v1/folders/:id
router.delete('/:id', folderController.deleteFolder);

module.exports = router;
