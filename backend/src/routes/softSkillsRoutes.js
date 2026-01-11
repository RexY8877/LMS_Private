// backend/src/routes/softSkillsRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getReadingTest, submitReading, submitSpeaking } = require('../controllers/softSkillsController');

const router = express.Router();

router.get('/reading/test', protect, getReadingTest);
router.post('/reading/submit', protect, submitReading);
router.post('/speaking/submit', protect, submitSpeaking);
// Add writing, etc.

module.exports = router;