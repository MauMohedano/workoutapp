const express = require('express');
const { getExercises, createExercise } = require('../controllers/exerciseController');
const router = express.Router();

router.get('/', getExercises);
router.post('/', createExercise);

module.exports = router;
