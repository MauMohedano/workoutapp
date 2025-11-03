const Routine = require('../models/Routine');

// GET - Obtener todas las rutinas
const getRoutines = async (req, res) => {
  try {
    const routines = await Routine.find()
      .select('_id name description isActive days createdAt')
      .sort({ createdAt: -1 });
    
    res.json(routines);
  } catch (error) {
    console.error('GET ROUTINES ERROR:', error);
    res.status(500).json({ error: 'Error al obtener rutinas' });
  }
};

// GET - Obtener una rutina específica
const getRoutineById = async (req, res) => {
  try {
    const { id } = req.params;
    const routine = await Routine.findById(id);
    
    if (!routine) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }
    
    res.json(routine);
  } catch (error) {
    console.error('GET ROUTINE ERROR:', error);
    res.status(500).json({ error: 'Error al obtener rutina' });
  }
};

// POST - Crear nueva rutina
const createRoutine = async (req, res) => {
  try {
    const { name, description, days } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    const newRoutine = new Routine({
      name,
      description: description || '',
      isActive: false,
      days: days || []
    });
    
    const saved = await newRoutine.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('CREATE ROUTINE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT - Actualizar rutina completa
const updateRoutine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, days } = req.body;
    
    const updated = await Routine.findByIdAndUpdate(
      id,
      { name, description, days },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('UPDATE ROUTINE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT - Activar/desactivar rutina
const toggleActiveRoutine = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Desactivar todas las rutinas primero
    await Routine.updateMany({}, { isActive: false });
    
    // Activar la rutina seleccionada
    const updated = await Routine.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('TOGGLE ACTIVE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE - Eliminar rutina
const deleteRoutine = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Routine.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }
    
    res.json({ 
      message: 'Rutina eliminada correctamente',
      deleted 
    });
  } catch (error) {
    console.error('DELETE ROUTINE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  toggleActiveRoutine,
  deleteRoutine
};