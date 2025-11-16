const express = require('express');
const router = express.Router();
const {
  searchCatalog,
  saveToCatalog,
  getPopular,
  getFavorites,
  toggleFavorite
} = require('../controllers/exerciseCatalogController');

// Búsqueda híbrida (DB + API Ninja)
router.get('/search', searchCatalog);

// Guardar ejercicio al catálogo
router.post('/', saveToCatalog);

// Más usados
router.get('/popular', getPopular);

// Favoritos
router.get('/favorites', getFavorites);
router.patch('/:id/favorite', toggleFavorite);

module.exports = router;