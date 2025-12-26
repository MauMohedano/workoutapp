const mongoose = require('mongoose');

const SessionProgressSchema = new mongoose.Schema({
  // Identificación temporal (deviceId → luego será userId)
  deviceId: { 
    type: String, 
    required: true,
    index: true
  },
  
  // ¿Qué rutina está siguiendo?
  routineId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Routine',
    required: true 
  },
  
  // Sesión actual (1-21) - La más alta alcanzada
  currentSession: { 
    type: Number, 
    default: 1,
    min: 1,
    max: 72  // Actualizado de 21 a 72 para soportar rutinas más largas
  },
  
  // ✨ NUEVO: Sesiones completadas con metadata
  completedSessions: [{
    sessionNumber: { 
      type: Number,
      required: true,
      min: 1,
      max: 72
    },
    duration: {
      type: Number,  // Duración en segundos
      required: false,  // No requerido para retrocompatibilidad
      min: 0
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Sesiones que el usuario decidió saltar
  skippedSessions: [{ 
    type: Number,
    min: 1,
    max: 72
  }],
  
  // Metadata
  startedAt: { 
    type: Date, 
    default: Date.now 
  },
  
  lastWorkoutDate: { 
    type: Date 
  },
  
  // Para migración futura a auth
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  }
}, { 
  timestamps: true 
});

// Índice compuesto para búsquedas rápidas
SessionProgressSchema.index({ deviceId: 1, routineId: 1 });

module.exports = mongoose.model('SessionProgress', SessionProgressSchema);