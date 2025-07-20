// api/shared-storage.js
// Stockage partagé pour les résultats d'authentification

const authResults = new Map();

// Nettoyer les anciens résultats (expire après 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of authResults.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) {
      authResults.delete(key);
    }
  }
}, 60 * 1000);

export { authResults };
