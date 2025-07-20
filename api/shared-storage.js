// api/shared-storage.js
// Stockage partagé pour les résultats d'authentification Discord et Google
// Utilisé par discord-callback.js et check-discord-auth/[session_id].js

// Map partagée pour stocker les résultats d'authentification
const authResults = new Map();

// Fonction de nettoyage des sessions expirées
function cleanupExpiredSessions() {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, value] of authResults.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) { // 10 minutes
      authResults.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Nettoyage: ${cleaned} sessions expirées supprimées`);
  }
  
  return cleaned;
}

// Nettoyer automatiquement toutes les minutes
setInterval(cleanupExpiredSessions, 60 * 1000);

// Fonction utilitaire pour ajouter un résultat
function setAuthResult(sessionId, result) {
  authResults.set(sessionId, {
    ...result,
    timestamp: Date.now()
  });
  console.log(`📝 Résultat stocké pour session: ${sessionId}`, { success: result.success, provider: result.provider });
}

// Fonction utilitaire pour récupérer un résultat
function getAuthResult(sessionId) {
  const result = authResults.get(sessionId);
  
  if (!result) {
    return null;
  }
  
  // Vérifier si le résultat n'est pas expiré
  const now = Date.now();
  if (now - result.timestamp > 10 * 60 * 1000) {
    authResults.delete(sessionId);
    console.log(`⏰ Session expirée supprimée: ${sessionId}`);
    return null;
  }
  
  return result;
}

// Fonction utilitaire pour supprimer un résultat
function deleteAuthResult(sessionId) {
  const deleted = authResults.delete(sessionId);
  if (deleted) {
    console.log(`🗑️ Session supprimée: ${sessionId}`);
  }
  return deleted;
}

// Fonction pour obtenir des statistiques
function getStats() {
  return {
    totalSessions: authResults.size,
    sessions: Array.from(authResults.entries()).map(([id, data]) => ({
      id: id.substring(0, 8) + '...',
      provider: data.provider,
      success: data.success,
      age: Math.round((Date.now() - data.timestamp) / 1000) + 's'
    }))
  };
}

// Exporter les fonctions et la Map
export { 
  authResults, 
  setAuthResult, 
  getAuthResult, 
  deleteAuthResult, 
  cleanupExpiredSessions,
  getStats 
};
