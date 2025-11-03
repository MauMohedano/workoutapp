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
    console.log('📦 BODY recibido:', req.body);
    
    // ✅ EXTRAER TODOS LOS CAMPOS DEL BODY (INCLUYENDO sessionNumber)
    const { exercise, reps, weight, sessionNumber, routineExerciseId } = req.body;

    // Validaciones
    if (!exercise || reps == null || weight == null) {
      return res.status(400).json({ error: 'exercise, reps y weight son requeridos' });
    }

    // ✅ VALIDAR sessionNumber (ahora es requerido)
    if (sessionNumber == null) {
      return res.status(400).json({ error: 'sessionNumber es requerido' });
    }

    // ✅ CREAR CON sessionNumber CORRECTAMENTE
    const newExercise = new Exercise({ 
      exercise, 
      reps: Number(reps), 
      weight: Number(weight),
      sessionNumber: Number(sessionNumber),  // ✅ Ahora sí está definido
      routineExerciseId: routineExerciseId || undefined
    });
    
    const savedExercise = await newExercise.save();

    console.log('✅ Set guardado con sessionNumber:', savedExercise.sessionNumber);

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

// ✅ MEJORADO: Obtener último entrenamiento de un ejercicio específico
const getLastWorkout = async (req, res) => {
  try {
    const { exerciseName, currentSession } = req.query;
    
    console.log('🔍 Buscando historial de:', exerciseName, '| Sesión actual:', currentSession);
    
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

    console.log('📊 Sets previos encontrados:', previousSets.length);

    if (!previousSets || previousSets.length === 0) {
      console.log('ℹ️ No hay historial previo');
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

    console.log('✅ Última sesión encontrada:', lastSessionNumber, 'con', lastWorkoutSets.length, 'sets');

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

module.exports = { getExercises, createExercise, updateExercise, getLastWorkout };