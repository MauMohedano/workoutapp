const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const exerciseRoutes = require('./src/routes/exerciseRoutes');
const ninjaRoutes = require('./src/routes/ninjaRoutes')

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/exercises', exerciseRoutes);
app.use('/api/ninja', ninjaRoutes);

// Conexión a Mongo
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(3003, () => console.log('Servidor corriendo en puerto 3003'));
   
  })
  .catch(err => console.error(err));