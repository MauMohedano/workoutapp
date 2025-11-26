const express = require('express');
const router = express.Router();
const { getUserStats } = require('../controllers/statsController');

/**
 * GET /api/stats/:deviceId
 * Obtener estadísticas del usuario
 * Query params opcionales:
 *   - period: 'week' | 'month' | 'year' | 'all' (default: 'all')
 */
router.get('/:deviceId', getUserStats);

module.exports = router;