const SessionProgress = require('../models/SessionProgress');

/**
 * GET /api/session-progress/:deviceId/:routineId
 * Obtener progreso de una rutina específica
 */
const getProgress = async (req, res) => {
  try {
    const { deviceId, routineId } = req.params;
    
    console.log('📊 Obteniendo progreso para:', deviceId, routineId);
    
    let progress = await SessionProgress.findOne({ deviceId, routineId });
    
    // Si no existe, crear uno nuevo
    if (!progress) {
      console.log('🆕 Creando progreso nuevo');
      progress = new SessionProgress({
        deviceId,
        routineId,
        currentSession: 1,
        completedSessions: [],
        skippedSessions: []
      });
      await progress.save();
    }
    
    console.log('✅ Progreso:', {
      currentSession: progress.currentSession,
      completedCount: progress.completedSessions.length,
      skippedCount: progress.skippedSessions.length
    });
    
    res.json(progress);
  } catch (error) {
    console.error('❌ GET PROGRESS ERROR:', error);
    res.status(500).json({ error: 'Error al obtener progreso' });
  }
};

/**
 * POST /api/session-progress/complete
 * Marcar sesión como completada
 */
const completeSession = async (req, res) => {
  try {
    const { deviceId, routineId, sessionNumber } = req.body;
    
    console.log('✅ Completando sesión:', sessionNumber);
    
    if (!deviceId || !routineId || !sessionNumber) {
      return res.status(400).json({ 
        error: 'deviceId, routineId y sessionNumber son requeridos' 
      });
    }
    
    let progress = await SessionProgress.findOne({ deviceId, routineId });
    
    if (!progress) {
      return res.status(404).json({ error: 'Progreso no encontrado' });
    }
    
    // Validar que la sesión sea válida (currentSession o currentSession + 1)
    if (sessionNumber > progress.currentSession + 1) {
      return res.status(400).json({ 
        error: `No puedes completar la sesión ${sessionNumber}. Debes estar en sesión ${progress.currentSession} o ${progress.currentSession + 1}` 
      });
    }
    
    // Agregar a completadas (si no está ya)
    if (!progress.completedSessions.includes(sessionNumber)) {
      progress.completedSessions.push(sessionNumber);
      progress.completedSessions.sort((a, b) => a - b);
      console.log('📝 Sesión agregada a completadas');
    }
    
    // Remover de skipped si estaba
    progress.skippedSessions = progress.skippedSessions.filter(
      s => s !== sessionNumber
    );
    
    // Actualizar currentSession al número más alto
    // Solo si completamos una sesión >= currentSession
    if (sessionNumber >= progress.currentSession) {
      progress.currentSession = sessionNumber + 1; // Avanzar a la siguiente
      console.log('⏭️ Avanzando a sesión:', progress.currentSession);
    }
    
    progress.lastWorkoutDate = new Date();
    
    await progress.save();
    
    console.log('✅ Sesión completada. Nueva sesión actual:', progress.currentSession);
    
    res.json(progress);
  } catch (error) {
    console.error('❌ COMPLETE SESSION ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/session-progress/skip
 * Saltar una sesión
 */
const skipSession = async (req, res) => {
  try {
    const { deviceId, routineId, sessionNumber } = req.body;
    
    console.log('⏭️ Saltando sesión:', sessionNumber);
    
    if (!deviceId || !routineId || !sessionNumber) {
      return res.status(400).json({ 
        error: 'deviceId, routineId y sessionNumber son requeridos' 
      });
    }
    
    let progress = await SessionProgress.findOne({ deviceId, routineId });
    
    if (!progress) {
      return res.status(404).json({ error: 'Progreso no encontrado' });
    }
    
    // Solo puedes saltar la sesión actual
    if (sessionNumber !== progress.currentSession) {
      return res.status(400).json({ 
        error: `Solo puedes saltar la sesión actual (${progress.currentSession})` 
      });
    }
    
    // Agregar a skipped (si no está ya)
    if (!progress.skippedSessions.includes(sessionNumber)) {
      progress.skippedSessions.push(sessionNumber);
      console.log('📝 Sesión agregada a saltadas');
    }
    
    // Remover de completed si estaba (edge case)
    progress.completedSessions = progress.completedSessions.filter(
      s => s !== sessionNumber
    );
    
    // Avanzar a la siguiente sesión
    progress.currentSession = sessionNumber + 1;
    console.log('⏭️ Avanzando a sesión:', progress.currentSession);
    
    await progress.save();
    
    console.log('✅ Sesión saltada. Nueva sesión actual:', progress.currentSession);
    
    res.json(progress);
  } catch (error) {
    console.error('❌ SKIP SESSION ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/session-progress/sync
 * Sincronizar desde AsyncStorage
 */
const syncProgress = async (req, res) => {
  try {
    const { 
      deviceId, 
      routineId, 
      currentSession, 
      completedSessions, 
      skippedSessions 
    } = req.body;
    
    console.log('🔄 Sincronizando progreso desde cliente');
    
    if (!deviceId || !routineId) {
      return res.status(400).json({ 
        error: 'deviceId y routineId son requeridos' 
      });
    }
    
    let progress = await SessionProgress.findOne({ deviceId, routineId });
    
    if (!progress) {
      // Crear nuevo si no existe
      progress = new SessionProgress({
        deviceId,
        routineId,
        currentSession: currentSession || 1,
        completedSessions: completedSessions || [],
        skippedSessions: skippedSessions || []
      });
      console.log('🆕 Creando progreso desde sync');
    } else {
      // Merge: tomar el valor más alto/completo
      progress.currentSession = Math.max(
        progress.currentSession, 
        currentSession || 1
      );
      
      // Merge arrays sin duplicados
      progress.completedSessions = [...new Set([
        ...progress.completedSessions, 
        ...(completedSessions || [])
      ])].sort((a, b) => a - b);
      
      progress.skippedSessions = [...new Set([
        ...progress.skippedSessions, 
        ...(skippedSessions || [])
      ])].sort((a, b) => a - b);
      
      console.log('🔄 Mergeando progreso existente');
    }
    
    await progress.save();
    
    console.log('✅ Progreso sincronizado');
    
    res.json(progress);
  } catch (error) {
    console.error('❌ SYNC PROGRESS ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProgress,
  completeSession,
  skipSession,
  syncProgress
};