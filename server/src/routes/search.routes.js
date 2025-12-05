const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

// GET /api/v1/search?q=query&tag=science&scope=public
router.get('/', optionalAuth, searchController.searchNotes);

// GET /api/v1/search/suggest?q=bio
router.get('/suggest', searchController.getSuggestions);

module.exports = router;
