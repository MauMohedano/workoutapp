const express = require('express');
const { getExercises, createExercise, updateExercise, getLastWorkout } = require('../controllers/exerciseController');
const router = express.Router();

router.get('/', getExercises);
router.post('/', createExercise);
router.put('/:id', updateExercise);
router.get('/last-workout', getLastWorkout);


module.exports = router;
