// api/check-discord-auth/[session_id].js
// Endpoint de polling pour vérifier le statut de l'authentification Discord

// Importer le stockage partagé (même Map que discord-callback.js)
// Note: En production, utilisez Redis ou une base de données partagée
const authResults = new Map();

export default function handler(req, res) {
  // Configurer CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: 'Méthode non autorisée',
      message: 'Seules les requêtes GET sont acceptées'
    });
    return;
  }

  try {
    const { session_id } = req.query;

    if (!session_id) {
      res.status(400).json({
        success: false,
        error: 'Session ID manquant',
        message: 'Le paramètre session_id est requis'
      });
      return;
    }

    console.log(`Vérification du statut Discord pour session: ${session_id}`);

    // Vérifier si nous avons un résultat pour cette session
    const result = authResults.get(session_id);

    if (!result) {
      // Pas encore de résultat - toujours en attente
      console.log(`Session ${session_id}: En attente`);
      res.status(202).json({
        success: false,
        status: 'pending',
        message: 'Authentification en cours...'
      });
      return;
    }

    // Vérifier si le résultat n'est pas trop ancien (10 minutes max)
    const now = Date.now();
    if (now - result.timestamp > 10 * 60 * 1000) {
      // Résultat expiré
      authResults.delete(session_id);
      console.log(`Session ${session_id}: Expirée`);
      res.status(408).json({
        success: false,
        error: 'Session expirée',
        message: 'La session d\'authentification a expiré'
      });
      return;
    }

    // Nous avons un résultat valide
    console.log(`Session ${session_id}: Résultat trouvé`, { success: result.success });

    if (result.success) {
      // Succès - retourner le code d'autorisation
      // Supprimer le résultat après l'avoir retourné (usage unique)
      authResults.delete(session_id);
      
      res.status(200).json({
        success: true,
        code: result.code,
        provider: result.provider || 'discord',
        message: 'Authentification Discord réussie'
      });
    } else {
      // Erreur - retourner l'erreur
      // Supprimer le résultat après l'avoir retourné
      authResults.delete(session_id);
      
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Erreur lors de l\'authentification Discord'
      });
    }

  } catch (error) {
    console.error('Erreur dans check-discord-auth:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Une erreur interne s\'est produite'
    });
  }
}

// Fonction utilitaire pour nettoyer les anciennes sessions (optionnel)
export function cleanupExpiredSessions() {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, value] of authResults.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) { // 10 minutes
      authResults.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`Nettoyage: ${cleaned} sessions expirées supprimées`);
  }
  
  return cleaned;
}

// Nettoyer automatiquement toutes les 5 minutes
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);
