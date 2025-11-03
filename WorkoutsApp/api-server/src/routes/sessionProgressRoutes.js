const express = require('express');
const {
  getProgress,
  completeSession,
  skipSession,
  syncProgress
} = require('../controllers/sessionProgressController');

const router = express.Router();

// GET progreso de una rutina
router.get('/:deviceId/:routineId', getProgress);

// POST completar sesión
router.post('/complete', completeSession);

// POST saltar sesión
router.post('/skip', skipSession);

// PUT sincronizar progreso
router.put('/sync', syncProgress);

module.exports = router;