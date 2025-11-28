const mongoose = require('mongoose');
const Routine = require('../models/Routine');
const Exercise = require('../models/Exercise');
const SessionProgress = require('../models/SessionProgress');
const Measurement = require('../models/Measurement');
require('dotenv').config();

const DEVICE_ID = 'AE4E5286-C44A-4758-81C8-39558BD396E2';

// ===== DATOS DE RUTINAS =====

const routines = [
  {
    deviceId: DEVICE_ID,
    name: 'Push Pull Legs',
    description: 'Rutina de 6 días por semana enfocada en hipertrofia',
    totalSessions: 36, // 12 semanas × 3 días
    isActive: true,
    days: [
      {
        name: 'Push (Pecho, Hombros, Tríceps)',
        order: 1,
        warm_up: ['5 min cardio ligero', 'Rotaciones de hombros'],
        cool_down: ['Estiramiento de pecho', 'Estiramiento de tríceps'],
        exercises: [
          { name: 'Bench Press', muscle: 'chest', equipment: 'barbell', type: 'strength', targetSets: 4, targetReps: '8-10', restTime: 120, order: 1 },
          { name: 'Incline Dumbbell Press', muscle: 'chest', equipment: 'dumbbell', type: 'strength', targetSets: 3, targetReps: '10-12', restTime: 90, order: 2 },
          { name: 'Dumbbell Flyes', muscle: 'chest', equipment: 'dumbbell', type: 'strength', targetSets: 3, targetReps: '12-15', restTime: 60, order: 3 },
          { name: 'Overhead Press', muscle: 'shoulders', equipment: 'barbell', type: 'strength', targetSets: 4, targetReps: '8-10', restTime: 120, order: 4 },
          { name: 'Lateral Raises', muscle: 'shoulders', equipment: 'dumbbell', type: 'strength', targetSets: 3, targetReps: '12-15', restTime: 60, order: 5 },
          { name: 'Tricep Dips', muscle: 'arms', equipment: 'bodyweight', type: 'strength', targetSets: 3, targetReps: '10-12', restTime: 90, order: 6 },
          { name: 'Tricep Pushdowns', muscle: 'arms', equipment: 'cable', type: 'strength', targetSets: 3, targetReps: '12-15', restTime: 60, order: 7 },
        ]
      },
      {
        name: 'Pull (Espalda, Bíceps)',
        order: 2,
        warm_up: ['5 min cardio ligero', 'Dead hangs'],
        cool_down: ['Estiramiento de espalda', 'Estiramiento de bíceps'],
        exercises: [
          { name: 'Deadlift', muscle: 'back', equipment: 'barbell', type: 'strength', targetSets: 4, targetReps: '6-8', restTime: 180, order: 1 },
          { name: 'Pull-ups', muscle: 'back', equipment: 'bodyweight', type: 'strength', targetSets: 3, targetReps: '8-10', restTime: 120, order: 2 },
          { name: 'Barbell Rows', muscle: 'back', equipment: 'barbell', type: 'strength', targetSets: 4, targetReps: '8-10', restTime: 120, order: 3 },
          { name: 'Lat Pulldowns', muscle: 'back', equipment: 'cable', type: 'strength', targetSets: 3, targetReps: '10-12', restTime: 90, order: 4 },
          { name: 'Face Pulls', muscle: 'shoulders', equipment: 'cable', type: 'strength', targetSets: 3, targetReps: '15-20', restTime: 60, order: 5 },
          { name: 'Barbell Curls', muscle: 'arms', equipment: 'barbell', type: 'strength', targetSets: 3, targetReps: '10-12', restTime: 90, order: 6 },
          { name: 'Hammer Curls', muscle: 'arms', equipment: 'dumbbell', type: 'strength', targetSets: 3, targetReps: '12-15', restTime: 60, order: 7 },
        ]
      },
      {
        name: 'Legs (Piernas, Core)',
        order: 3,
        warm_up: ['5 min bici', 'Movilidad de cadera'],
        cool_down: ['Estiramiento de piernas', 'Foam rolling'],
        exercises: [
          { name: 'Back Squat', muscle: 'legs', equipment: 'barbell', type: 'strength', targetSets: 4, targetReps: '8-10', restTime: 180, order: 1 },
          { name: 'Romanian Deadlift', muscle: 'legs', equipment: 'barbell', type: 'strength', targetSets: 3, targetReps: '10-12', restTime: 120, order: 2 },
          { name: 'Leg Press', muscle: 'legs', equipment: 'machine', type: 'strength', targetSets: 3, targetReps: '12-15', restTime: 90, order: 3 },
          { name: 'Leg Curls', muscle: 'legs', equipment: 'machine', type: 'strength', targetSets: 3, targetReps: '12-15', restTime: 60, order: 4 },
          { name: 'Calf Raises', muscle: 'legs', equipment: 'machine', type: 'strength', targetSets: 4, targetReps: '15-20', restTime: 60, order: 5 },
          { name: 'Planks', muscle: 'core', equipment: 'bodyweight', type: 'strength', targetSets: 3, targetReps: '60s', restTime: 60, order: 6 },
        ]
      }
    ]
  },
  {
    deviceId: DEVICE_ID,
    name: 'Upper/Lower Split',
    description: 'Rutina de 4 días enfocada en fuerza',
    totalSessions: 24, // 12 semanas × 2 días
    isActive: false,
    days: [
      {
        name: 'Upper Body',
        order: 1,
        warm_up: ['Movilidad de hombros'],
        cool_down: ['Estiramiento superior'],
        exercises: [
          { name: 'Bench Press', muscle: 'chest', equipment: 'barbell', type: 'strength', targetSets: 5, targetReps: '5', restTime: 180, order: 1 },
          { name: 'Barbell Rows', muscle: 'back', equipment: 'barbell', type: 'strength', targetSets: 5, targetReps: '5', restTime: 180, order: 2 },
          { name: 'Overhead Press', muscle: 'shoulders', equipment: 'barbell', type: 'strength', targetSets: 4, targetReps: '8', restTime: 120, order: 3 },
          { name: 'Pull-ups', muscle: 'back', equipment: 'bodyweight', type: 'strength', targetSets: 3, targetReps: '8-10', restTime: 120, order: 4 },
          { name: 'Dips', muscle: 'arms', equipment: 'bodyweight', type: 'strength', targetSets: 3, targetReps: '8-10', restTime: 90, order: 5 },
        ]
      },
      {
        name: 'Lower Body',
        order: 2,
        warm_up: ['Movilidad de cadera'],
        cool_down: ['Estiramiento inferior'],
        exercises: [
          { name: 'Back Squat', muscle: 'legs', equipment: 'barbell', type: 'strength', targetSets: 5, targetReps: '5', restTime: 180, order: 1 },
          { name: 'Deadlift', muscle: 'back', equipment: 'barbell', type: 'strength', targetSets: 3, targetReps: '5', restTime: 180, order: 2 },
          { name: 'Leg Press', muscle: 'legs', equipment: 'machine', type: 'strength', targetSets: 3, targetReps: '10', restTime: 120, order: 3 },
          { name: 'Leg Curls', muscle: 'legs', equipment: 'machine', type: 'strength', targetSets: 3, targetReps: '12', restTime: 90, order: 4 },
        ]
      }
    ]
  },
  {
    deviceId: DEVICE_ID,
    name: 'Full Body 3x',
    description: 'Rutina de cuerpo completo 3 veces por semana',
    totalSessions: 18, // 6 semanas × 3 días
    isActive: false,
    days: [
      {
        name: 'Full Body A',
        order: 1,
        warm_up: ['Cardio ligero'],
        cool_down: ['Estiramiento general'],
        exercises: [
          { name: 'Back Squat', muscle: 'legs', equipment: 'barbell', type: 'strength', targetSets: 4, targetReps: '8', restTime: 120, order: 1 },
          { name: 'Bench Press', muscle: 'chest', equipment: 'barbell', type: 'strength', targetSets: 4, targetReps: '8', restTime: 120, order: 2 },
          { name: 'Pull-ups', muscle: 'back', equipment: 'bodyweight', type: 'strength', targetSets: 3, targetReps: '8-10', restTime: 90, order: 3 },
          { name: 'Overhead Press', muscle: 'shoulders', equipment: 'dumbbell', type: 'strength', targetSets: 3, targetReps: '10', restTime: 90, order: 4 },
        ]
      }
    ]
  }
];

// ===== FUNCIÓN PARA GENERAR SETS REALISTAS =====

async function generateWorkoutSets(routineId, routine) {
  const sets = [];
  const sessionsCompleted = Math.floor(Math.random() * 8) + 5; // 5-12 sesiones completadas
  
  for (let session = 1; session <= sessionsCompleted; session++) {
    const dayIndex = (session - 1) % routine.days.length;
    const day = routine.days[dayIndex];
    
    for (const exercise of day.exercises) {
      const numSets = exercise.targetSets;
      const baseWeight = getBaseWeight(exercise.name);
      
      for (let setNum = 1; setNum <= numSets; setNum++) {
        // Progresión de peso a través de las semanas
        const weekNumber = Math.floor((session - 1) / routine.days.length) + 1;
        const progressionMultiplier = 1 + (weekNumber - 1) * 0.025; // 2.5% por semana
        const weight = Math.round(baseWeight * progressionMultiplier);
        
        // Reps con variación natural
        const targetReps = parseInt(exercise.targetReps.split('-')[0]) || 8;
        const reps = targetReps + Math.floor(Math.random() * 3) - 1;
        
        sets.push({
          deviceId: DEVICE_ID,
          routineId: routineId,
          exercise: exercise.name,
          reps: Math.max(1, reps),
          weight: weight,
          sessionNumber: session,
          routineExerciseId: exercise._id,
          createdAt: getDateForSession(session, routine.days.length),
        });
      }
    }
  }
  
  return sets;
}

// Pesos base realistas por ejercicio
function getBaseWeight(exerciseName) {
  const weights = {
    'Bench Press': 60,
    'Back Squat': 80,
    'Deadlift': 100,
    'Overhead Press': 40,
    'Barbell Rows': 60,
    'Incline Dumbbell Press': 25,
    'Dumbbell Flyes': 15,
    'Lateral Raises': 10,
    'Tricep Dips': 0,
    'Tricep Pushdowns': 30,
    'Pull-ups': 0,
    'Lat Pulldowns': 50,
    'Face Pulls': 20,
    'Barbell Curls': 30,
    'Hammer Curls': 15,
    'Romanian Deadlift': 70,
    'Leg Press': 150,
    'Leg Curls': 40,
    'Calf Raises': 60,
    'Planks': 0,
    'Dips': 0,
  };
  
  return weights[exerciseName] || 20;
}

// Generar fechas realistas (últimos 3 meses)
function getDateForSession(sessionNumber, daysPerWeek) {
  const now = new Date();
  const daysAgo = Math.floor((sessionNumber - 1) / daysPerWeek) * 7 + ((sessionNumber - 1) % daysPerWeek) * 2;
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date;
}

// ===== GENERAR MEDICIONES =====

function generateMeasurements() {
  const measurements = [];
  const now = new Date();
  
  // 6 mediciones a lo largo de 3 meses
  for (let i = 0; i < 6; i++) {
    const daysAgo = i * 15; // Cada 15 días
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Progresión de peso (bajando gradualmente)
    const weight = 77.8 - (i * 0.4);
    
    // Progresión de circunferencias
    const chest = 93 + i * 0.3;
    const waist = 82 - i * 0.3;
    const arms = 34 + i * 0.2;
    
    measurements.push({
      deviceId: DEVICE_ID,
      date: date,
      weight: Math.round(weight * 10) / 10,
      circumferences: {
        chest: Math.round(chest * 10) / 10,
        waist: Math.round(waist * 10) / 10,
        leftArm: Math.round(arms * 10) / 10,
        rightArm: Math.round(arms * 10) / 10,
      },
      notes: i === 0 ? 'Medición más reciente' : i === 5 ? 'Medición inicial' : '',
    });
  }
  
  return measurements.reverse(); // Más antigua primero
}

// ===== FUNCIÓN PRINCIPAL DE SEED =====

async function seedDatabase() {
  try {
    console.log('🌱 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Limpiar datos existentes del usuario
    console.log('🗑️  Limpiando datos existentes...');
    await Routine.deleteMany({ deviceId: DEVICE_ID });
    await Exercise.deleteMany({ deviceId: DEVICE_ID });
    await SessionProgress.deleteMany({ deviceId: DEVICE_ID });
    await Measurement.deleteMany({ deviceId: DEVICE_ID });
    console.log('✅ Datos limpiados');
    
    // Insertar rutinas
    console.log('📝 Creando rutinas...');
    const createdRoutines = await Routine.insertMany(routines);
    console.log(`✅ ${createdRoutines.length} rutinas creadas`);
    
    // Generar sets para cada rutina
    console.log('🏋️  Generando sets de ejercicios...');
    let totalSets = 0;
    
    for (const routine of createdRoutines) {
      const sets = await generateWorkoutSets(routine._id, routine);
      if (sets.length > 0) {
        await Exercise.insertMany(sets);
        totalSets += sets.length;
      }
      
      // Crear progreso de sesión
      const sessionsCompleted = [...new Set(sets.map(s => s.sessionNumber))];
      if (sessionsCompleted.length > 0) {
        await SessionProgress.create({
          deviceId: DEVICE_ID,
          routineId: routine._id,
          currentSession: Math.max(...sessionsCompleted) + 1,
          completedSessions: sessionsCompleted.sort((a, b) => a - b),
          skippedSessions: [],
          lastWorkoutDate: sets[sets.length - 1].createdAt,
        });
      }
    }
    console.log(`✅ ${totalSets} sets generados`);
    
    // Insertar mediciones
    console.log('📏 Creando mediciones...');
    const measurements = generateMeasurements();
    await Measurement.insertMany(measurements);
    console.log(`✅ ${measurements.length} mediciones creadas`);
    
    console.log('\n🎉 ¡Seed completado exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   - ${createdRoutines.length} rutinas`);
    console.log(`   - ${totalSets} sets de ejercicios`);
    console.log(`   - ${measurements.length} mediciones`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

// Ejecutar seed
seedDatabase();