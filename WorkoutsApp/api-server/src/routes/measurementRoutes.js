const express = require('express');
const router = express.Router();
const measurementController = require('../controllers/measurementController');

// Rutas principales
router.get('/', measurementController.getMeasurements);
router.get('/latest', measurementController.getLatestMeasurement);
router.get('/stats', measurementController.getMeasurementStats);
router.get('/:id', measurementController.getMeasurementById);
router.post('/', measurementController.createMeasurement);
router.put('/:id', measurementController.updateMeasurement);
router.delete('/:id', measurementController.deleteMeasurement);

module.exports = router;