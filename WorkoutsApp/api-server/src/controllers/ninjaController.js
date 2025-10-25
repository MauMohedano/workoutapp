const { searchExercises } = require('../services/ninjaService');

/**
 * GET /api/ninja/exercises
 * Busca ejercicios en API Ninja
 * Query params: muscle, name, type, difficulty
 */
const getNinjaExercises = async (req, res) => {
  try {
    const { muscle, name, type, difficulty } = req.query;
    
    // Crear objeto de filtros solo con los que existen
    const filters = {};
    if (muscle) filters.muscle = muscle;
    if (name) filters.name = name;
    if (type) filters.type = type;
    if (difficulty) filters.difficulty = difficulty;
    
    const exercises = await searchExercises(filters);
    
    res.json({
      count: exercises.length,
      exercises
    });
  } catch (error) {
    console.error('Error en getNinjaExercises:', error.message);
    res.status(500).json({ 
      error: 'Error al buscar ejercicios',
      message: error.message 
    });
  }
};

module.exports = { getNinjaExercises };