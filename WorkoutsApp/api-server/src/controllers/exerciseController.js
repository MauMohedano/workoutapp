const Exercise = require('../models/Exercise');

// Obtener todos los ejercicios
const getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find().select('_id exercise reps weight sessionNumber createdAt');
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ejercicios' });
  }
};

// Crear un ejercicio
const createExercise = async (req, res) => {
  try {
    

    const { exercise, reps, weight, sessionNumber, routineExerciseId, deviceId, routineId } = req.body;

    // Validaciones
    if (!exercise || reps == null || weight == null) {
      return res.status(400).json({ error: 'exercise, reps y weight son requeridos' });
    }

    // Validar nuevos campos requeridos
    if (!deviceId || !routineId) {
      return res.status(400).json({ error: 'deviceId y routineId son requeridos' });
    }

    // ✅ VALIDAR sessionNumber (ahora es requerido)
    if (sessionNumber == null) {
      return res.status(400).json({ error: 'sessionNumber es requerido' });
    }

    // ✅ CREAR CON sessionNumber CORRECTAMENTE
    const newExercise = new Exercise({
      deviceId,
      routineId,
      exercise,
      reps: Number(reps),
      weight: Number(weight),
      sessionNumber: Number(sessionNumber),
      routineExerciseId: routineExerciseId || undefined
    });

    const savedExercise = await newExercise.save();

    

    res.json({
      _id: savedExercise._id,
      exercise: savedExercise.exercise,
      reps: savedExercise.reps,
      weight: savedExercise.weight,
      sessionNumber: savedExercise.sessionNumber,
      routineExerciseId: savedExercise.routineExerciseId,
      createdAt: savedExercise.createdAt
    });
  } catch (error) {
    console.error('❌ CREATE EXERCISE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un set
const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const { exercise, reps, weight } = req.body;

    const updated = await Exercise.findByIdAndUpdate(
      id,
      { exercise, reps: Number(reps), weight: Number(weight) },
      { new: true, runValidators: true }
    ).select('_id exercise reps weight sessionNumber createdAt');

    if (!updated) {
      return res.status(404).json({ error: 'Set no encontrado' });
    }

    res.json(updated);
  } catch (error) {
    console.error('❌ UPDATE EXERCISE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

//  Obtener último entrenamiento de un ejercicio específico
const getLastWorkout = async (req, res) => {
  try {
    const { exerciseName, currentSession } = req.query;

    

    if (!exerciseName) {
      return res.status(400).json({ error: 'exerciseName es requerido' });
    }

    const currentSessionNum = Number(currentSession) || 999;

    // Buscar sets de sesiones ANTERIORES del mismo ejercicio
    const previousSets = await Exercise.find({
      exercise: exerciseName,
      sessionNumber: { $lt: currentSessionNum }  // ✅ Solo sesiones anteriores
    })
      .sort({ sessionNumber: -1, createdAt: -1 })  // Más reciente primero
      .limit(20)  // Últimos 20 sets para agrupar
      .select('_id exercise reps weight sessionNumber createdAt');

    

    if (!previousSets || previousSets.length === 0) {
      
      return res.json({
        sessionNumber: null,
        sets: [],
        hasHistory: false
      });
    }

    // Agrupar por sesión
    const sessionGroups = {};
    previousSets.forEach(set => {
      if (!sessionGroups[set.sessionNumber]) {
        sessionGroups[set.sessionNumber] = [];
      }
      sessionGroups[set.sessionNumber].push(set);
    });

    // Tomar la sesión más reciente
    const lastSessionNumber = Object.keys(sessionGroups).sort((a, b) => b - a)[0];
    const lastWorkoutSets = sessionGroups[lastSessionNumber] || [];

    

    res.json({
      sessionNumber: lastSessionNumber ? Number(lastSessionNumber) : null,
      sets: lastWorkoutSets,
      hasHistory: lastWorkoutSets.length > 0
    });
  } catch (error) {
    console.error('❌ GET LAST WORKOUT ERROR:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

const getSetsBySession = async (req, res) => {
  try {
    const { deviceId, routineId, sessionNumber } = req.query;

    if (!deviceId || !routineId || !sessionNumber) {
      return res.status(400).json({
        error: 'deviceId, routineId y sessionNumber son requeridos'
      });
    }

    

    const sets = await Exercise.find({
      deviceId,
      routineId,
      sessionNumber: Number(sessionNumber)
    }).sort({ createdAt: 1 }); // Ordenar por fecha

    

    res.json(sets);
  } catch (error) {
    console.error('❌ GET SETS BY SESSION ERROR:', error);
    res.status(500).json({ error: 'Error al obtener sets de la sesión' });
  }
};



module.exports = { getExercises, createExercise, updateExercise, getLastWorkout, getSetsBySession };