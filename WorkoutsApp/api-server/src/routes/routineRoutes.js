const express = require('express');
const {
  getRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  toggleActiveRoutine,
  deleteRoutine
} = require('../controllers/routineController');

const router = express.Router();

// Rutas básicas
router.get('/', getRoutines);
router.get('/:id', getRoutineById);
router.post('/', createRoutine);
router.put('/:id', updateRoutine);
router.delete('/:id', deleteRoutine);

// Ruta especial para activar rutina
router.put('/:id/activate', toggleActiveRoutine);

module.exports = router;