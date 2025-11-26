const mongoose = require('mongoose');

// Sub-esquema para ejercicios
const ExerciseSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  muscle: { 
    type: String, 
    required: true 
  },
  equipment: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    default: 'strength' 
  },
  targetSets: { 
    type: Number, 
    required: true 
  },
  targetReps: { 
    type: String, 
    required: true 
  },
  restTime: { 
    type: Number, 
    default: 90  // segundos
  },
  order: { 
    type: Number, 
    required: true 
  },
  notes: { 
    type: String, 
    default: '' 
  }
});

// Sub-esquema para días
const DaySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  order: { 
    type: Number, 
    required: true 
  },
  warm_up: [{ 
    type: String 
  }],
  cool_down: [{ 
    type: String 
  }],
  exercises: [ExerciseSchema]
});

// Esquema principal de Rutina
const RoutineSchema = new mongoose.Schema({
   deviceId: {
    type: String,
    required: true,
    index: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    default: ''
  },
  totalSessions: {
    type: Number,
    required: true,
    min: 12,
    max: 72
  },
  isActive: { 
    type: Boolean, 
    default: false 
  },
  days: [DaySchema]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Routine', RoutineSchema);