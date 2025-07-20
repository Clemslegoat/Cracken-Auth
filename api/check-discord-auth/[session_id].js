// api/check-discord-auth/[session_id].js
// Endpoint de polling pour vérifier le statut de l'authentification Discord

// NOUVEAU (CommonJS)
const { getAuthResult, deleteAuthResult } = require('../shared-storage.js');

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
    const result = getAuthResult(session_id);

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

    // Nous avons un résultat valide
    console.log(`Session ${session_id}: Résultat trouvé`, { success: result.success });

    if (result.success) {
      // Succès - retourner le code d'autorisation
      // Supprimer le résultat après l'avoir retourné (usage unique)
      deleteAuthResult(session_id);

      res.status(200).json({
        success: true,
        code: result.code,
        provider: result.provider || 'discord',
        message: 'Authentification Discord réussie'
      });
    } else {
      // Erreur - retourner l'erreur
      // Supprimer le résultat après l'avoir retourné
      deleteAuthResult(session_id);

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

// Le nettoyage des sessions est maintenant géré par shared-storage.js
