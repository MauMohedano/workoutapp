const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  // Identificación del usuario/dispositivo
  deviceId: { 
    type: String, 
    required: true,
    index: true 
  },
  
  // Rutina a la que pertenece este set
  routineId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Routine',
    required: true,
    index: true
  },
  
  // Datos del ejercicio
  exercise: { 
    type: String, 
    required: true 
  },
  reps: { 
    type: Number, 
    required: true 
  },
  weight: { 
    type: Number, 
    required: true 
  },
  
  // Contexto de la sesión
  sessionNumber: { 
    type: Number, 
    required: true 
  },
  routineExerciseId: { 
    type: String 
  }
}, { 
  timestamps: true 
});

// Índices compuestos para queries eficientes de estadísticas
ExerciseSchema.index({ deviceId: 1, routineId: 1 });
ExerciseSchema.index({ deviceId: 1, sessionNumber: 1 });
ExerciseSchema.index({ deviceId: 1, exercise: 1 });

module.exports = mongoose.model('Exercise', ExerciseSchema, "sets");