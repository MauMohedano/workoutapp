const ExerciseCatalog = require('../models/ExerciseCatalog');
const { searchExercises } = require('../services/ninjaService');

/**
 * 🔍 BUSCAR EJERCICIOS (Híbrido: MongoDB + API Ninja)
 */
const searchCatalog = async (req, res) => {
  try {
    const { q = '', muscle = '', equipment = '', limit = 20 } = req.query;
    
    // 1. Buscar en nuestra DB primero
    const dbQuery = {};
    
    if (q) {
      dbQuery.name = new RegExp(q, 'i'); // Case insensitive
    }
    
    if (muscle) {
      dbQuery.muscle = new RegExp(muscle, 'i');
    }
    
    if (equipment) {
      dbQuery.equipment = new RegExp(equipment, 'i');
    }
    
    const dbExercises = await ExerciseCatalog
      .find(dbQuery)
      .sort({ timesUsed: -1 }) // Más usados primero
      .limit(parseInt(limit));
    
    // 2. Si tenemos suficientes en DB, retornar solo esos
    if (dbExercises.length >= limit) {
      return res.json({
        source: 'database',
        count: dbExercises.length,
        exercises: dbExercises
      });
    }
    
    // 3. Si no, complementar con API Ninja
    try {
      const ninjaFilters = {};
      if (q) ninjaFilters.name = q;
      if (muscle) ninjaFilters.muscle = muscle;
      if (equipment) ninjaFilters.equipment = equipment;
      
      const ninjaExercises = await searchExercises(ninjaFilters);
      
      // Filtrar los que ya tenemos en DB
      const dbNames = new Set(dbExercises.map(ex => ex.name.toLowerCase()));
      const newNinjaExercises = ninjaExercises
        .filter(ex => !dbNames.has(ex.name.toLowerCase()))
        .slice(0, limit - dbExercises.length);
      
      // 4. Combinar resultados
      const combinedExercises = [
        ...dbExercises.map(ex => ex.toObject()),
        ...newNinjaExercises
      ];
      
      return res.json({
        source: 'hybrid',
        dbCount: dbExercises.length,
        ninjaCount: newNinjaExercises.length,
        count: combinedExercises.length,
        exercises: combinedExercises
      });
      
    } catch (ninjaError) {
      console.error('Error API Ninja:', ninjaError.message);
      
      // Si falla API Ninja, retornar solo DB
      return res.json({
        source: 'database_only',
        count: dbExercises.length,
        exercises: dbExercises,
        warning: 'API Ninja no disponible'
      });
    }
    
  } catch (error) {
    console.error('Error buscando en catálogo:', error);
    res.status(500).json({ 
      error: 'Error al buscar ejercicios',
      message: error.message 
    });
  }
};

/**
 * 💾 GUARDAR EJERCICIO EN CATÁLOGO
 * Se llama cuando el usuario agrega un ejercicio a su rutina
 */
const saveToCatalog = async (req, res) => {
  try {
    const exerciseData = req.body;
    
    // Verificar si ya existe
    let exercise = await ExerciseCatalog.findOne({ 
      name: exerciseData.name 
    });
    
    if (exercise) {
      // Si existe, incrementar uso
      exercise.timesUsed += 1;
      await exercise.save();
      
      return res.json({
        message: 'Ejercicio ya existe, contador actualizado',
        exercise
      });
    }
    
    // Si no existe, crear nuevo
    exercise = new ExerciseCatalog(exerciseData);
    await exercise.save();
    
    res.status(201).json({
      message: 'Ejercicio guardado en catálogo',
      exercise
    });
    
  } catch (error) {
    console.error('Error guardando en catálogo:', error);
    res.status(500).json({ 
      error: 'Error al guardar ejercicio',
      message: error.message 
    });
  }
};

/**
 * 📊 EJERCICIOS MÁS USADOS
 */
const getPopular = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const exercises = await ExerciseCatalog
      .find()
      .sort({ timesUsed: -1 })
      .limit(parseInt(limit));
    
    res.json({
      count: exercises.length,
      exercises
    });
    
  } catch (error) {
    console.error('Error obteniendo populares:', error);
    res.status(500).json({ error: 'Error al obtener ejercicios' });
  }
};

/**
 * ⭐ EJERCICIOS FAVORITOS
 */
const getFavorites = async (req, res) => {
  try {
    const exercises = await ExerciseCatalog
      .find({ isFavorite: true })
      .sort({ name: 1 });
    
    res.json({
      count: exercises.length,
      exercises
    });
    
  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
};

/**
 * ⭐ TOGGLE FAVORITO
 */
const toggleFavorite = async (req, res) => {
  try {
    const exercise = await ExerciseCatalog.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }
    
    exercise.isFavorite = !exercise.isFavorite;
    await exercise.save();
    
    res.json({
      message: exercise.isFavorite ? 'Agregado a favoritos' : 'Removido de favoritos',
      exercise
    });
    
  } catch (error) {
    console.error('Error actualizando favorito:', error);
    res.status(500).json({ error: 'Error al actualizar favorito' });
  }
};

module.exports = {
  searchCatalog,
  saveToCatalog,
  getPopular,
  getFavorites,
  toggleFavorite
};