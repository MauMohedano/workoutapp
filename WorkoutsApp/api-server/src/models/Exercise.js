const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  exercise: { type: String, required: true },
  reps: { type: Number, required: true },
  weight: { type: Number, required: true },
  sessionNumber: { type: Number, required: true },
  routineExerciseId: { type: String }
}, { timestamps: true }); // Guardamos timestamps, pero no los vamos a exponer

module.exports = mongoose.model('Exercise', ExerciseSchema, "sets");