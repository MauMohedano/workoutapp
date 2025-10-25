
const axios = require('axios');

const API_KEY = 'uGWx0k6Eqhe7blqm9zMd0A==tOUvjWiqePReh8Ps';
const BASE_URL = 'https://api.api-ninjas.com/v1/exercises';

/**
 * Busca ejercicios en API Ninja
 * @param {Object} filters - { muscle, name, type, difficulty }
 * @returns {Promise<Array>} Lista de ejercicios
 */
const searchExercises = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Agregar filtros que existan
    if (filters.muscle) params.append('muscle', filters.muscle);
    if (filters.name) params.append('name', filters.name);
    if (filters.type) params.append('type', filters.type);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    
    const url = `${BASE_URL}?${params.toString()}`;
    
    const response = await axios.get(url, {
      headers: { 'X-Api-Key': API_KEY }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error en API Ninja:', error.message);
    throw new Error('No se pudieron obtener ejercicios de API Ninja');
  }
};

module.exports = { searchExercises };