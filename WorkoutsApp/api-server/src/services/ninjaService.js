
const axios = require('axios');

const API_KEY = process.env.NINJA_API_KEY;
const BASE_URL = 'https://api.api-ninjas.com/v1/exercises';

/**
 * Busca ejercicios en API Ninja
 * @param {Object} filters - { muscle, name, type, difficulty }
 * @returns {Promise<Array>} Lista de ejercicios
 */
const searchExercises = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.muscle) params.append('muscle', filters.muscle);
    if (filters.name) params.append('name', filters.name);
    if (filters.type) params.append('type', filters.type);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);

    const url = `${BASE_URL}?${params.toString()}`;

    // Debug temporal
    console.log('🔍 Ninja API Request:', {
      url,
      filters,
      paramsString: params.toString()
    });

    const response = await axios.get(url, {
      headers: { 'X-Api-Key': API_KEY }
    });

    return response.data;
  } catch (error) {
    // Debug más detallado
    console.error('Error en API Ninja:', error.response?.status, error.response?.data || error.message);
    throw new Error('No se pudieron obtener ejercicios de API Ninja');
  }
};

module.exports = { searchExercises };