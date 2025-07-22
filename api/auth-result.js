// api/auth-result.js
// Endpoint pour récupérer les résultats d'authentification depuis la page de succès

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

  console.log(`🔍 Recherche résultat auth pour session: ${session_id}`);

  try {
    // Utiliser le stockage simple en mémoire
    const { getAuthResult, deleteAuthResult } = require('./simple-storage.js');

    console.log(`🔍 Recherche dans le stockage simple pour session: ${session_id}`);
    const authResult = await getAuthResult(session_id);

    if (authResult && authResult.success) {
      console.log(`✅ Données trouvées dans stockage simple pour session ${session_id}`);

      // Marquer pour suppression après récupération
      await deleteAuthResult(session_id);

      return res.status(200).json({
        status: 'success',
        data: authResult.data || authResult,
        provider: authResult.provider
      });
    }

    // Aucune donnée trouvée
    console.log(`⏳ Aucun résultat pour session ${session_id} - en attente`);
    return res.status(200).json({
      status: 'pending',
      message: 'Authentification en cours...'
    });

  } catch (error) {
    console.error('Erreur lors de la recherche auth result:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Erreur serveur lors de la vérification du statut'
    });
  }
};
