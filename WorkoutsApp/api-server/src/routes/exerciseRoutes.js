const express = require('express');
const { getExercises, createExercise, updateExercise, getLastWorkout, getSetsBySession } = require('../controllers/exerciseController');
const router = express.Router();

router.get('/last-workout', getLastWorkout);
router.get('/session', getSetsBySession);
router.get('/', getExercises);
router.post('/', createExercise);
router.put('/:id', updateExercise);
router.get('/by-session', getSetsBySession);


module.exports = router;
