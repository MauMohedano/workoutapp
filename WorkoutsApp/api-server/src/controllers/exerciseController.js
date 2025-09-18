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
    const { exercise, reps, weight } = req.body;
    const newExercise = new Exercise({ exercise, reps, weight });
    const savedExercise = await newExercise.save();

    // devolver solo los campos necesarios
    res.json({
      _id: savedExercise._id,
      exercise: savedExercise.exercise,
      reps: savedExercise.reps,
      weight: savedExercise.weight
    });
  } catch (error) {
    res.status(400).json({ error: 'Error al crear ejercicio' });
  }
};

module.exports = { getExercises, createExercise };