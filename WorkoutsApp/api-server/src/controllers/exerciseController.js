const Exercise = require('../models/Exercise');

// Obtener todos los ejercicios
const getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find().select('_id exercise reps weight');
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ejercicios' });
  }
};

// Crear un ejercicio
const createExercise = async (req, res) => {
  try {
    console.log('BODY:', req.body);  // <- ver exactamente qué llega
    const { exercise, reps, weight } = req.body;

    if (!exercise || reps == null || weight == null) {
      return res.status(400).json({ error: 'exercise, reps y weight son requeridos' });
    }

    const newExercise = new Exercise({ exercise, reps: Number(reps), weight: Number(weight) });
    const savedExercise = await newExercise.save();

    res.json({
      _id: savedExercise._id,
      exercise: savedExercise.exercise,
      reps: savedExercise.reps,
      weight: savedExercise.weight
    });
  } catch (error) {
    console.error('CREATE EXERCISE ERROR:', error); // <- mostrar error real
    res.status(500).json({ error: error.message });
  }
};
module.exports = { getExercises, createExercise };