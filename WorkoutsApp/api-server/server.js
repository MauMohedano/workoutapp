const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const exerciseRoutes = require('./src/routes/exerciseRoutes');
const ninjaRoutes = require('./src/routes/ninjaRoutes')
const routineRoutes = require('./src/routes/routineRoutes');
const sessionProgressRoutes = require('./src/routes/sessionProgressRoutes');
const exerciseCatalogRoutes = require('./src/routes/exerciseCatalogRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const measurementRoutes = require('./src/routes/measurementRoutes');



const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/exercises', exerciseRoutes);
app.use('/api/ninja', ninjaRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/session-progress', sessionProgressRoutes);
app.use('/api/catalog', exerciseCatalogRoutes)
app.use('/api/stats', statsRoutes);
app.use('/api/measurements', measurementRoutes);

// Conexión a Mongo
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    
     app.listen(3003, '0.0.0.0', () => {
      
      
      
      
       
       
    });
  })
  .catch(err => console.error(err));