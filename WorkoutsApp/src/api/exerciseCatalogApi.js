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
    
    console.log('📡 Buscando ejercicios:', { q, muscle, equipment });
    
    const response = await fetch(`${API_URL}/catalog/search?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to search exercises');
    }
    
    const data = await response.json();
    console.log('✅ Ejercicios encontrados:', data.count);
    
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

/**
 * 📊 EJERCICIOS MÁS USADOS
 */
export const getPopularExercises = async (limit = 10) => {
  try {
    const response = await fetch(`${API_URL}/catalog/popular?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to get popular exercises');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error getting popular exercises:', error);
    throw error;
  }
};

/**
 * ⭐ EJERCICIOS FAVORITOS
 */
export const getFavoriteExercises = async () => {
  try {
    const response = await fetch(`${API_URL}/catalog/favorites`);
    
    if (!response.ok) {
      throw new Error('Failed to get favorites');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
};

/**
 * ⭐ TOGGLE FAVORITO
 */
export const toggleFavorite = async (exerciseId) => {
  try {
    const response = await fetch(`${API_URL}/catalog/${exerciseId}/favorite`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle favorite');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};