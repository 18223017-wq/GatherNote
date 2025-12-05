const express = require('express');
const router = express.Router();
const noteController = require('../controllers/note.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// POST /api/v1/notes
router.post('/', noteController.createNote);

// GET /api/v1/notes?sort=newest&status=ongoing
router.get('/', noteController.getNotes);

// GET /api/v1/notes/:id
router.get('/:id', noteController.getNoteById);

// PUT /api/v1/notes/:id
router.put('/:id', noteController.updateNote);

// DELETE /api/v1/notes/:id
router.delete('/:id', noteController.deleteNote);

// PATCH /api/v1/notes/:id/pin
router.patch('/:id/pin', noteController.togglePin);

// PATCH /api/v1/notes/:id/move
router.patch('/:id/move', noteController.moveNote);

module.exports = router;
