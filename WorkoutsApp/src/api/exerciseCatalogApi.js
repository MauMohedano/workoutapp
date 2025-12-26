// Usar la misma IP que routineApi.js
import { API_URL } from '../config/api';

/**
 * 🔍 BUSCAR EJERCICIOS
 * Búsqueda híbrida (MongoDB + API Ninja)
 */
export const searchExercises = async (params = {}) => {
  try {
    const { q = '', muscle = '', equipment = '', limit = 20 } = params;
    
    // Construir query params
    const queryParams = new URLSearchParams();
    if (q) queryParams.append('q', q);
    if (muscle) queryParams.append('muscle', muscle);
    if (equipment) queryParams.append('equipment', equipment);
    queryParams.append('limit', limit);
    
    
    
    const response = await fetch(`${API_URL}/catalog/search?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to search exercises');
    }
    
    const data = await response.json();
    
    
    return data;
  } catch (error) {
    console.error('❌ Error searching exercises:', error);
    throw error;
  }
};

/**
 * 💾 GUARDAR EJERCICIO EN CATÁLOGO
 * Se llama automáticamente cuando agregas ejercicio a rutina
 */
export const saveExerciseToCatalog = async (exerciseData) => {
  try {
    const response = await fetch(`${API_URL}/catalog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exerciseData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save exercise to catalog');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error saving exercise to catalog:', error);
    throw error;
  }
};

