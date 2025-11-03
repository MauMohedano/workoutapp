const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const exerciseRoutes = require('./src/routes/exerciseRoutes');
const ninjaRoutes = require('./src/routes/ninjaRoutes')
const routineRoutes = require('./src/routes/routineRoutes');
const sessionProgressRoutes = require('./src/routes/sessionProgressRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/exercises', exerciseRoutes);
app.use('/api/ninja', ninjaRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/session-progress', sessionProgressRoutes);

// Conexión a Mongo
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado');
     app.listen(3003, '0.0.0.0', () => {
      console.log('🚀 Servidor corriendo en puerto 3003');
      console.log('📝 Sets API: http://localhost:3003/api/exercises');
      console.log('🔍 Ninja API: http://localhost:3003/api/ninja/exercises');
      console.log('💪 Routines API: http://localhost:3003/api/routines');
    });
  })
  .catch(err => console.error(err));