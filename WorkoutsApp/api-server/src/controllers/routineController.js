const Routine = require('../models/Routine');
const SessionProgress = require('../models/SessionProgress');

// GET - Obtener todas las rutinas
const getRoutines = async (req, res) => {
  try {
    const { deviceId } = req.query;
    
    const routines = await Routine.find()
      .select('_id name description isActive days totalSessions createdAt')
      .sort({ createdAt: -1 });

    // Si hay deviceId, agregar el progreso de cada rutina
    if (deviceId) {
      const routinesWithProgress = await Promise.all(
        routines.map(async (routine) => {
          const progress = await SessionProgress.findOne({
            deviceId,
            routineId: routine._id
          });
          
          return {
            ...routine.toObject(),
            progress: progress ? {
              currentSession: progress.currentSession,
              completedSessions: progress.completedSessions,
              skippedSessions: progress.skippedSessions
            } : {
              currentSession: 1,
              completedSessions: [],
              skippedSessions: []
            }
          };
        })
      );
      
      return res.json(routinesWithProgress);
    }

    res.json(routines);
  } catch (error) {
    console.error('GET ROUTINES ERROR:', error);
    res.status(500).json({ error: 'Error al obtener rutinas' });
  }
};

// GET - Obtener una rutina específica
const getRoutineById = async (req, res) => {
  try {
    const { id } = req.params;
    const routine = await Routine.findById(id);

    if (!routine) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }

    res.json(routine);
  } catch (error) {
    console.error('GET ROUTINE ERROR:', error);
    res.status(500).json({ error: 'Error al obtener rutina' });
  }
};


// POST - Crear nueva rutina
const createRoutine = async (req, res) => {
  try {
    const { name, description, days, totalSessions } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    if (!days || !Array.isArray(days) || days.length === 0) {
      return res.status(400).json({ error: 'Debes agregar al menos un día a la rutina' });
    }

    if (!totalSessions || totalSessions < 12 || totalSessions > 72) {
      return res.status(400).json({ error: 'El número de sesiones debe estar entre 12 y 72' });
    }
    // Verificar que al menos un día tenga ejercicios
    const hasExercises = days.some(day =>
      day.exercises && Array.isArray(day.exercises) && day.exercises.length > 0
    );

    if (!hasExercises) {
      return res.status(400).json({ error: 'Debes agregar al menos un ejercicio a la rutina' });
    }

    // ✅ Procesar días y ejercicios
    const processedDays = days.map((day, dayIndex) => ({
      name: day.name || day.dayName || `Día ${dayIndex + 1}`,
      order: day.order !== undefined ? day.order : dayIndex,
      warm_up: day.warm_up || [],
      cool_down: day.cool_down || [],
      exercises: (day.exercises || []).map((exercise, exerciseIndex) => ({
        name: exercise.name,
        muscle: exercise.muscle || exercise.primaryMuscle || '',
        equipment: exercise.equipment || '',
        type: exercise.type || 'strength',
        targetSets: parseInt(exercise.targetSets || exercise.sets) || 3,
        targetReps: String(exercise.targetReps || exercise.reps || '10'),
        restTime: parseInt(exercise.restTime) || 90,
        order: exercise.order !== undefined ? exercise.order : exerciseIndex,
        notes: exercise.notes || ''
      }))
    }));

    const newRoutine = new Routine({
      name: name.trim(),
      description: description || '',
      totalSessions: parseInt(totalSessions),
      isActive: false,
      days: processedDays  // Datos procesados correctamente
    });

    const saved = await newRoutine.save();

    // ✅ Log informativo
    console.log(`✅ Rutina creada: ${saved.name} - ${saved.days.length} días - ${saved.days.reduce((total, day) => total + day.exercises.length, 0)} ejercicios`);

    res.status(201).json(saved);
  } catch (error) {
    console.error('CREATE ROUTINE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT - Actualizar rutina completa
const updateRoutine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, days } = req.body;

    const updated = await Routine.findByIdAndUpdate(
      id,
      { name, description, days },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }

    res.json(updated);
  } catch (error) {
    console.error('UPDATE ROUTINE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT - Activar/desactivar rutina
const toggleActiveRoutine = async (req, res) => {
  try {
    const { id } = req.params;

    // Desactivar todas las rutinas primero
    await Routine.updateMany({}, { isActive: false });

    // Activar la rutina seleccionada
    const updated = await Routine.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }

    res.json(updated);
  } catch (error) {
    console.error('TOGGLE ACTIVE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE - Eliminar rutina
const deleteRoutine = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Routine.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }

    res.json({
      message: 'Rutina eliminada correctamente',
      deleted
    });
  } catch (error) {
    console.error('DELETE ROUTINE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  toggleActiveRoutine,
  deleteRoutine
};