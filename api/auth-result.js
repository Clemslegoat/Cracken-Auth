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
    // Récupérer la page de succès Google
    const googleUrl = `https://cracken-auth.vercel.app/api/success-page?session_id=${session_id}&provider=google`;
    const discordUrl = `https://cracken-auth.vercel.app/api/success-page?session_id=${session_id}&provider=discord`;
    
    // Essayer Google d'abord
    try {
      const googleResponse = await fetch(googleUrl);
      if (googleResponse.ok) {
        const googleHtml = await googleResponse.text();
        const dataMatch = googleHtml.match(/<div class="hidden-data" id="auth-data">([^<]+)<\/div>/);
        
        if (dataMatch) {
          const encodedData = dataMatch[1];
          const decodedData = JSON.parse(Buffer.from(encodedData, 'base64').toString());
          
          if (decodedData.session_id === session_id) {
            console.log(`✅ Données Google trouvées pour session ${session_id}`);
            return res.status(200).json({
              status: 'success',
              data: decodedData,
              provider: 'google'
            });
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Pas de données Google pour session ${session_id}`);
    }

    // Essayer Discord ensuite
    try {
      const discordResponse = await fetch(discordUrl);
      if (discordResponse.ok) {
        const discordHtml = await discordResponse.text();
        const dataMatch = discordHtml.match(/<div class="hidden-data" id="auth-data">([^<]+)<\/div>/);
        
        if (dataMatch) {
          const encodedData = dataMatch[1];
          const decodedData = JSON.parse(Buffer.from(encodedData, 'base64').toString());
          
          if (decodedData.session_id === session_id) {
            console.log(`✅ Données Discord trouvées pour session ${session_id}`);
            return res.status(200).json({
              status: 'success',
              data: decodedData,
              provider: 'discord'
            });
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Pas de données Discord pour session ${session_id}`);
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
