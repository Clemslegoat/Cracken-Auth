// api/shared-storage.js
// Stockage partagé pour les résultats d'authentification Discord et Google
// Utilisé par discord-callback.js, google-callback.js et les endpoints de polling

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
async function setAuthResult(sessionId, result) {
  console.log(`🔄 STORAGE: Tentative de stockage pour session: ${sessionId}`);
  console.log(`🔄 STORAGE: Données à stocker:`, result);

  authResults.set(sessionId, {
    ...result,
    timestamp: Date.now()
  });

  // Vérifier immédiatement que le stockage a fonctionné
  const stored = authResults.get(sessionId);
  console.log(`📝 STORAGE: Résultat stocké pour session: ${sessionId}`, { success: result.success, provider: result.provider });
  console.log(`✅ STORAGE: Vérification stockage:`, stored ? 'TROUVÉ' : 'ÉCHEC');
  console.log(`📊 STORAGE: Total sessions stockées: ${authResults.size}`);

  return true; // Retourner une promesse résolue
}

// Fonction utilitaire pour récupérer un résultat
async function getAuthResult(sessionId) {
  console.log(`🔍 STORAGE: Recherche session: ${sessionId}`);
  console.log(`📊 STORAGE: Total sessions disponibles: ${authResults.size}`);
  console.log(`🗂️ STORAGE: Sessions stockées:`, Array.from(authResults.keys()));

  const result = authResults.get(sessionId);

  if (!result) {
    console.log(`❌ STORAGE: Session ${sessionId} NON TROUVÉE`);
    return null;
  }

  console.log(`✅ STORAGE: Session ${sessionId} TROUVÉE:`, result);

  // Vérifier si le résultat n'est pas expiré
  const now = Date.now();
  const age = now - result.timestamp;
  console.log(`⏰ STORAGE: Âge de la session: ${Math.round(age/1000)}s`);

  if (age > 10 * 60 * 1000) {
    authResults.delete(sessionId);
    console.log(`⏰ Session expirée supprimée: ${sessionId}`);
    return null;
  }

  console.log(`🎯 STORAGE: Retour de la session valide`);
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

// Exporter les fonctions (CommonJS)
module.exports = {
  authResults,
  setAuthResult,
  getAuthResult,
  deleteAuthResult,
  cleanupExpiredSessions,
  getStats
};
