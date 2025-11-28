const mongoose = require('mongoose');

// Sub-esquema para circunferencias
const CircumferencesSchema = new mongoose.Schema({
  chest: { 
    type: Number,  // cm
    min: 0,
    max: 300
  },
  waist: { 
    type: Number,  // cm
    min: 0,
    max: 300
  },
  hips: { 
    type: Number,  // cm
    min: 0,
    max: 300
  },
  leftArm: { 
    type: Number,  // cm
    min: 0,
    max: 100
  },
  rightArm: { 
    type: Number,  // cm
    min: 0,
    max: 100
  },
  leftThigh: { 
    type: Number,  // cm
    min: 0,
    max: 150
  },
  rightThigh: { 
    type: Number,  // cm
    min: 0,
    max: 150
  }
}, { _id: false });  // No necesita _id propio

// Esquema principal de Medición
const MeasurementSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  weight: {
    type: Number,  // kg
    min: 0,
    max: 500
  },
  circumferences: CircumferencesSchema,
  notes: {
    type: String,
    maxlength: 500,
    trim: true,
    default: ''
  }
}, { 
  timestamps: true 
});

// Índice compuesto para búsquedas eficientes
MeasurementSchema.index({ deviceId: 1, date: -1 });

// Validación: al menos peso o una circunferencia
MeasurementSchema.pre('save', function(next) {
  const hasWeight = this.weight != null;
  const hasCircumference = this.circumferences && Object.values(this.circumferences.toObject()).some(val => val != null);
  
  if (!hasWeight && !hasCircumference) {
    next(new Error('Debe proporcionar al menos peso o una circunferencia'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Measurement', MeasurementSchema);