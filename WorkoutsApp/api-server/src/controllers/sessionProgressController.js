const SessionProgress = require('../models/SessionProgress');

/**
 * 🔄 HELPER: Migrar completedSessions de números a objetos
 * Convierte [1, 2, 3] → [{sessionNumber: 1}, {sessionNumber: 2}, ...]
 */
const migrateCompletedSessions = (sessions) => {
  if (!sessions || sessions.length === 0) return [];
  
  return sessions.map(s => {
    // Si ya es objeto, mantenerlo
    if (typeof s === 'object' && s.sessionNumber) {
      return s;
    }
    // Si es número, convertir a objeto
    if (typeof s === 'number') {
      return {
        sessionNumber: s,
        duration: null,
        completedAt: new Date()
      };
    }
    return s;
  });
};

/**
 * GET /api/session-progress/:deviceId/:routineId
 * Obtener progreso de una rutina específica
 */
const getProgress = async (req, res) => {
  try {
    const { deviceId, routineId } = req.params;
    
    let progress = await SessionProgress.findOne({ deviceId, routineId });
    
    // Si no existe, crear uno nuevo
    if (!progress) {
      progress = new SessionProgress({
        deviceId,
        routineId,
        currentSession: 1,
        completedSessions: [],
        skippedSessions: []
      });
      await progress.save();
    } else {
      // 🔄 MIGRAR datos antiguos si es necesario
      let needsMigration = false;
      
      if (progress.completedSessions && progress.completedSessions.length > 0) {
        const hasOldFormat = progress.completedSessions.some(s => typeof s === 'number');
        
        if (hasOldFormat) {
          console.log('🔄 Migrando datos antiguos a nuevo formato...');
          progress.completedSessions = migrateCompletedSessions(progress.completedSessions);
          needsMigration = true;
        }
      }
      
      if (needsMigration) {
        await progress.save();
        console.log('✅ Migración completada');
      }
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
 * ✨ NUEVO: Ahora acepta duration (opcional)
 */
const completeSession = async (req, res) => {
  try {
    const { deviceId, routineId, sessionNumber, duration } = req.body;
    
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
    
    // 🔄 MIGRAR datos antiguos primero si es necesario
    if (progress.completedSessions && progress.completedSessions.length > 0) {
      const hasOldFormat = progress.completedSessions.some(s => typeof s === 'number');
      if (hasOldFormat) {
        console.log('🔄 Migrando datos antiguos antes de completar...');
        progress.completedSessions = migrateCompletedSessions(progress.completedSessions);
      }
    }
    
    // ✨ Verificar si la sesión ya está completada
    const alreadyCompleted = progress.completedSessions.find(
      s => s.sessionNumber === sessionNumber
    );
    
    if (!alreadyCompleted) {
      // Agregar sesión completada con metadata
      const sessionData = {
        sessionNumber: sessionNumber,
        duration: duration || null,
        completedAt: new Date()
      };
      
      progress.completedSessions.push(sessionData);
      
      // Ordenar por sessionNumber
      progress.completedSessions.sort((a, b) => a.sessionNumber - b.sessionNumber);
      
      console.log('✅ Sesión completada:', {
        sessionNumber,
        duration: duration ? `${duration}s (${Math.floor(duration / 60)}m)` : 'N/A'
      });
    } else {
      console.log('ℹ️ Sesión ya estaba completada:', sessionNumber);
    }
    
    // Remover de skipped si estaba
    progress.skippedSessions = progress.skippedSessions.filter(
      s => s !== sessionNumber
    );
    
    // Actualizar currentSession al número más alto
    if (sessionNumber >= progress.currentSession) {
      progress.currentSession = sessionNumber + 1;
    }
    
    progress.lastWorkoutDate = new Date();
    
    await progress.save();
    
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
    
    // 🔄 MIGRAR datos antiguos primero si es necesario
    if (progress.completedSessions && progress.completedSessions.length > 0) {
      const hasOldFormat = progress.completedSessions.some(s => typeof s === 'number');
      if (hasOldFormat) {
        console.log('🔄 Migrando datos antiguos antes de skip...');
        progress.completedSessions = migrateCompletedSessions(progress.completedSessions);
      }
    }
    
    // Agregar a skipped (si no está ya)
    if (!progress.skippedSessions.includes(sessionNumber)) {
      progress.skippedSessions.push(sessionNumber);
    }
    
    // Remover de completed si estaba
    progress.completedSessions = progress.completedSessions.filter(s => 
      s.sessionNumber !== sessionNumber
    );
    
    // Avanzar a la siguiente sesión
    progress.currentSession = sessionNumber + 1;
    
    await progress.save();
    
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
        completedSessions: migrateCompletedSessions(completedSessions || []),
        skippedSessions: skippedSessions || []
      });
    } else {
      // 🔄 MIGRAR datos antiguos primero
      if (progress.completedSessions && progress.completedSessions.length > 0) {
        const hasOldFormat = progress.completedSessions.some(s => typeof s === 'number');
        if (hasOldFormat) {
          console.log('🔄 Migrando datos antiguos en sync...');
          progress.completedSessions = migrateCompletedSessions(progress.completedSessions);
        }
      }
      
      // Merge: tomar el valor más alto/completo
      progress.currentSession = Math.max(
        progress.currentSession, 
        currentSession || 1
      );
      
      // Migrar datos entrantes también
      const migratedIncoming = migrateCompletedSessions(completedSessions || []);
      
      // Merge teniendo en cuenta objetos
      const existingNumbers = new Set(
        progress.completedSessions.map(s => s.sessionNumber)
      );
      
      const newSessions = migratedIncoming.filter(s => 
        !existingNumbers.has(s.sessionNumber)
      );
      
      progress.completedSessions = [
        ...progress.completedSessions,
        ...newSessions
      ].sort((a, b) => a.sessionNumber - b.sessionNumber);
      
      // Merge skipped
      progress.skippedSessions = [...new Set([
        ...progress.skippedSessions, 
        ...(skippedSessions || [])
      ])].sort((a, b) => a - b);
    }
    
    await progress.save();
    
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