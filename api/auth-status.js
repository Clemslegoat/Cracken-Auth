// api/auth-status.js
// Endpoint pour le polling des résultats d'authentification

const { getAuthResult, deleteAuthResult } = require('./shared-storage.js');

module.exports = async function handler(req, res) {
  // Permettre CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ 
      error: 'session_id requis',
      status: 'error'
    });
  }

  console.log(`🔍 Polling auth status pour session: ${session_id}`);

  try {
    // Importer les stats pour voir toutes les sessions stockées
    const { getStats } = require('./shared-storage.js');
    const stats = getStats();
    console.log(`📊 Sessions actuellement stockées:`, stats);

    // Récupérer le résultat d'authentification
    const authResult = await getAuthResult(session_id);

    if (!authResult) {
      console.log(`⏳ Aucun résultat pour session ${session_id} - en attente`);
      console.log(`🔍 Sessions disponibles: ${stats.sessions.map(s => s.id).join(', ')}`);
      return res.status(200).json({
        status: 'pending',
        message: 'Authentification en cours...'
      });
    }

    console.log(`✅ Résultat trouvé pour session ${session_id}:`, authResult);

    // Nettoyer le résultat après récupération
    deleteAuthResult(session_id);

    if (authResult.success) {
      return res.status(200).json({
        status: 'success',
        data: authResult.data,
        provider: authResult.provider
      });
    } else {
      return res.status(200).json({
        status: 'error',
        error: authResult.error,
        provider: authResult.provider
      });
    }

  } catch (error) {
    console.error('Erreur lors du polling auth status:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Erreur serveur lors de la vérification du statut'
    });
  }
};
