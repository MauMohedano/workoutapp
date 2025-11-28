const Measurement = require('../models/Measurement');

// GET /api/measurements - Obtener todas las mediciones del usuario
exports.getMeasurements = async (req, res) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId es requerido' 
      });
    }

    const measurements = await Measurement.find({ deviceId })
      .sort({ date: -1 })  // Más reciente primero
      .lean();

    res.json({ 
      success: true, 
      data: measurements,
      count: measurements.length
    });
  } catch (error) {
    console.error('Error al obtener mediciones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener mediciones',
      error: error.message 
    });
  }
};

// GET /api/measurements/latest - Obtener la última medición
exports.getLatestMeasurement = async (req, res) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId es requerido' 
      });
    }

    const measurement = await Measurement.findOne({ deviceId })
      .sort({ date: -1 })
      .lean();

    if (!measurement) {
      return res.json({ 
        success: true, 
        data: null,
        message: 'No hay mediciones registradas'
      });
    }

    res.json({ 
      success: true, 
      data: measurement 
    });
  } catch (error) {
    console.error('Error al obtener última medición:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener última medición',
      error: error.message 
    });
  }
};

// GET /api/measurements/:id - Obtener una medición por ID
exports.getMeasurementById = async (req, res) => {
  try {
    const { id } = req.params;
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId es requerido' 
      });
    }

    const measurement = await Measurement.findOne({ 
      _id: id, 
      deviceId 
    }).lean();

    if (!measurement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medición no encontrada' 
      });
    }

    res.json({ 
      success: true, 
      data: measurement 
    });
  } catch (error) {
    console.error('Error al obtener medición:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener medición',
      error: error.message 
    });
  }
};

// POST /api/measurements - Crear nueva medición
exports.createMeasurement = async (req, res) => {
  try {
    const { deviceId, date, weight, circumferences, notes } = req.body;

    if (!deviceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId es requerido' 
      });
    }

    // Validar que al menos haya peso o una circunferencia
    const hasWeight = weight != null;
    const hasCircumference = circumferences && Object.values(circumferences).some(val => val != null);

    if (!hasWeight && !hasCircumference) {
      return res.status(400).json({ 
        success: false, 
        message: 'Debe proporcionar al menos peso o una circunferencia' 
      });
    }

    const measurement = new Measurement({
      deviceId,
      date: date || Date.now(),
      weight,
      circumferences,
      notes
    });

    await measurement.save();

    res.status(201).json({ 
      success: true, 
      data: measurement,
      message: 'Medición creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear medición:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear medición',
      error: error.message 
    });
  }
};

// PUT /api/measurements/:id - Actualizar medición
exports.updateMeasurement = async (req, res) => {
  try {
    const { id } = req.params;
    const { deviceId, date, weight, circumferences, notes } = req.body;

    if (!deviceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId es requerido' 
      });
    }

    // Buscar medición existente
    const measurement = await Measurement.findOne({ 
      _id: id, 
      deviceId 
    });

    if (!measurement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medición no encontrada' 
      });
    }

    // Actualizar campos
    if (date) measurement.date = date;
    if (weight !== undefined) measurement.weight = weight;
    if (circumferences !== undefined) measurement.circumferences = circumferences;
    if (notes !== undefined) measurement.notes = notes;

    await measurement.save();

    res.json({ 
      success: true, 
      data: measurement,
      message: 'Medición actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar medición:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar medición',
      error: error.message 
    });
  }
};

// DELETE /api/measurements/:id - Eliminar medición
exports.deleteMeasurement = async (req, res) => {
  try {
    const { id } = req.params;
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId es requerido' 
      });
    }

    const measurement = await Measurement.findOneAndDelete({ 
      _id: id, 
      deviceId 
    });

    if (!measurement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medición no encontrada' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Medición eliminada exitosamente',
      data: measurement
    });
  } catch (error) {
    console.error('Error al eliminar medición:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar medición',
      error: error.message 
    });
  }
};

// GET /api/measurements/stats - Estadísticas de progreso
exports.getMeasurementStats = async (req, res) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId es requerido' 
      });
    }

    const measurements = await Measurement.find({ deviceId })
      .sort({ date: 1 })  // Más antigua primero
      .lean();

    if (measurements.length === 0) {
      return res.json({ 
        success: true, 
        data: {
          totalMeasurements: 0,
          weightChange: null,
          latestWeight: null,
          measurements: []
        }
      });
    }

    const latestMeasurement = measurements[measurements.length - 1];
    const firstMeasurement = measurements[0];

    const weightChange = latestMeasurement.weight && firstMeasurement.weight
      ? latestMeasurement.weight - firstMeasurement.weight
      : null;

    res.json({ 
      success: true, 
      data: {
        totalMeasurements: measurements.length,
        weightChange,
        latestWeight: latestMeasurement.weight,
        firstWeight: firstMeasurement.weight,
        latestDate: latestMeasurement.date,
        firstDate: firstMeasurement.date,
        measurements: measurements.map(m => ({
          date: m.date,
          weight: m.weight
        }))
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas',
      error: error.message 
    });
  }
};