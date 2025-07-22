// api/debug-sessions.js
// Endpoint de debug pour voir toutes les sessions stockées

const { getStats } = require('./external-storage.js');

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

  try {
    const stats = getStats();
    
    console.log('🔍 DEBUG: Sessions actuellement stockées:', stats);
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      ...stats
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
};
