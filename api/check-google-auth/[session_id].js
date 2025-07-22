// api/check-google-auth/[session_id].js
// Endpoint de polling pour vérifier le statut de l'authentification Google

// Importer le stockage partagé (CommonJS)
const { getAuthResult, deleteAuthResult } = require('../shared-storage.js');

module.exports = function handler(req, res) {
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

    console.log(`Vérification du statut Google pour session: ${session_id}`);

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
      // Succès - retourner les données utilisateur
      // Supprimer le résultat après l'avoir retourné (usage unique)
      deleteAuthResult(session_id);

      res.status(200).json({
        success: true,
        email: result.email,
        name: result.name,
        access_token: result.access_token,
        provider: result.provider || 'google',
        message: 'Authentification Google réussie'
      });
    } else {
      // Erreur - retourner l'erreur
      // Supprimer le résultat après l'avoir retourné
      deleteAuthResult(session_id);

      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Erreur lors de l\'authentification Google'
      });
    }

  } catch (error) {
    console.error('Erreur dans check-google-auth:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: error.message
    });
  }
};
