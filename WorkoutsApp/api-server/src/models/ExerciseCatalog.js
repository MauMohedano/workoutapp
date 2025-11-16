const mongoose = require('mongoose');

/**
 * 📚 CATÁLOGO DE EJERCICIOS
 * Almacena ejercicios disponibles (separado de los sets completados)
 */
const ExerciseCatalogSchema = new mongoose.Schema({
  // Nombre único del ejercicio
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Datos de API Ninja
  type: {
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
  
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'expert']
  },
  
  instructions: {
    type: String,
    required: true
  },
  
  // Metadata para nuestro uso
  timesUsed: {
    type: Number,
    default: 0
  },
  
  isFavorite: {
    type: Boolean,
    default: false
  },
  
  // Defaults sugeridos
  defaultSets: {
    type: Number,
    default: 3
  },
  
  defaultReps: {
    type: Number,
    default: 10
  },
  
  defaultRest: {
    type: Number,
    default: 90
  },
  
  // Origen del dato
  source: {
    type: String,
    enum: ['api_ninja', 'user_created'],
    default: 'api_ninja'
  }
}, {
  timestamps: true
});

// Índices para búsqueda rápida
ExerciseCatalogSchema.index({ name: 'text', muscle: 1, equipment: 1 });
ExerciseCatalogSchema.index({ timesUsed: -1 });

module.exports = mongoose.model('ExerciseCatalog', ExerciseCatalogSchema);