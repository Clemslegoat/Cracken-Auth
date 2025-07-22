// api/auth-result.js
// Endpoint pour récupérer les résultats d'authentification

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
    // Vérifier si on a un résultat dans la variable globale
    if (global.currentAuthResult &&
        global.currentAuthResult.session_id === session_id &&
        global.currentAuthResult.timestamp > Date.now() - 10 * 60 * 1000) {

      console.log(`✅ Données trouvées dans variable globale pour session ${session_id}`);

      const result = global.currentAuthResult;

      // Nettoyer après récupération
      delete global.currentAuthResult;

      if (result.success) {
        return res.status(200).json({
          status: 'success',
          data: result.data,
          provider: result.provider
        });
      } else {
        return res.status(200).json({
          status: 'error',
          error: result.error,
          provider: result.provider
        });
      }
    }

    // Si pas de données, attendre un peu au cas où la redirection est en cours
    console.log(`🔍 Première vérification échouée pour session ${session_id}, attente de 2 secondes...`);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Vérifier à nouveau après l'attente
    if (global.currentAuthResult &&
        global.currentAuthResult.session_id === session_id &&
        global.currentAuthResult.timestamp > Date.now() - 10 * 60 * 1000) {

      console.log(`✅ Données trouvées après attente pour session ${session_id}`);

      const result = global.currentAuthResult;
      delete global.currentAuthResult;

