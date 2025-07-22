// api/simple-storage.js
// Stockage ultra-simple en mémoire avec fallback

// Map globale partagée (simple et efficace)
global.authSessions = global.authSessions || new Map();

// Fonction pour stocker un résultat d'authentification
async function setAuthResult(sessionId, result) {
  try {
    console.log(`📝 SIMPLE STORAGE: Stockage pour session ${sessionId}`);
    
    const data = {
      ...result,
      timestamp: Date.now()
    };
    
    global.authSessions.set(sessionId, data);
    
    console.log(`✅ SIMPLE STORAGE: Session ${sessionId} stockée`);
    console.log(`📊 SIMPLE STORAGE: Total sessions: ${global.authSessions.size}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ SIMPLE STORAGE: Erreur stockage session ${sessionId}:`, error);
    return false;
  }
}

// Fonction pour récupérer un résultat d'authentification
async function getAuthResult(sessionId) {
  try {
    console.log(`🔍 SIMPLE STORAGE: Recherche session ${sessionId}`);
    console.log(`📊 SIMPLE STORAGE: Sessions disponibles: ${global.authSessions.size}`);
    
    const result = global.authSessions.get(sessionId);
    
    if (!result) {
      console.log(`❌ SIMPLE STORAGE: Session ${sessionId} non trouvée`);
      return null;
    }
    
    // Vérifier si le résultat n'est pas expiré (10 minutes)
    const now = Date.now();
    const age = now - result.timestamp;
    
    if (age > 10 * 60 * 1000) {
      global.authSessions.delete(sessionId);
      console.log(`⏰ SIMPLE STORAGE: Session ${sessionId} expirée (${Math.round(age/1000)}s)`);
      return null;
    }
    
    console.log(`✅ SIMPLE STORAGE: Session ${sessionId} trouvée (âge: ${Math.round(age/1000)}s)`);
    return result;
    
  } catch (error) {
    console.error(`❌ SIMPLE STORAGE: Erreur lecture session ${sessionId}:`, error);
    return null;
  }
}

// Fonction pour supprimer un résultat d'authentification
async function deleteAuthResult(sessionId) {
  try {
    const deleted = global.authSessions.delete(sessionId);
    if (deleted) {
      console.log(`🗑️ SIMPLE STORAGE: Session ${sessionId} supprimée`);
    }
    return deleted;
  } catch (error) {
    console.error(`❌ SIMPLE STORAGE: Erreur suppression session ${sessionId}:`, error);
    return false;
  }
}

// Fonction pour obtenir des statistiques
async function getStats() {
  try {
    const sessions = [];
    
    for (const [sessionId, data] of global.authSessions.entries()) {
      sessions.push({
        id: sessionId.substring(0, 8) + '...',
        provider: data.provider,
        success: data.success,
        age: Math.round((Date.now() - data.timestamp) / 1000) + 's'
      });
    }
    
    return {
      totalSessions: sessions.length,
      sessions: sessions
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return { totalSessions: 0, sessions: [] };
  }
}

module.exports = {
  setAuthResult,
  getAuthResult,
  deleteAuthResult,
  getStats
};
