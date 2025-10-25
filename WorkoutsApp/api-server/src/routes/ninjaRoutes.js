const express = require('express');
const { getNinjaExercises } = require('../controllers/ninjaController');
const router = express.Router();

// GET /api/ninja/exercises?muscle=biceps
router.get('/exercises', getNinjaExercises);

module.exports = router;