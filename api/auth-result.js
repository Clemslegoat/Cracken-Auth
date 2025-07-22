// api/auth-result.js
// Endpoint pour récupérer les résultats d'authentification - Version finale

const fetch = require("node-fetch");

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
    // Essayer de récupérer la page de succès qui contient les données
    console.log(`🌐 Tentative de récupération de la page de succès...`);
    
    // Construire l'URL de base de notre domaine
    const baseUrl = req.headers.host ? `https://${req.headers.host}` : 'https://cracken-auth.vercel.app';
    
    // Essayer plusieurs URLs possibles où les données pourraient être stockées
    const possibleUrls = [
      `${baseUrl}/api/auth-success?session_check=${session_id}`,
      `${baseUrl}/api/get-auth-data?session_id=${session_id}`
    ];
    
    for (const url of possibleUrls) {
      try {
        console.log(`🔍 Test URL: ${url}`);
        const response = await fetch(url, { timeout: 5000 });
        
        if (response.ok) {
          const text = await response.text();
          
          // Chercher les données dans le HTML
          const dataMatch = text.match(/<div class="hidden-data" id="auth-data">([^<]+)<\/div>/);
          const sessionMatch = text.match(/<div class="hidden-data" id="session-id">([^<]+)<\/div>/);
          
          if (dataMatch && sessionMatch && sessionMatch[1] === session_id) {
            console.log(`✅ Données trouvées dans la page de succès pour session ${session_id}`);
            
            try {
              const encodedData = dataMatch[1];
              const decodedData = JSON.parse(Buffer.from(encodedData, 'base64').toString());
              
              if (decodedData.success) {
                return res.status(200).json({
                  status: 'success',
                  data: decodedData.data,
                  provider: decodedData.provider
                });
              } else {
                return res.status(200).json({
                  status: 'error',
                  error: decodedData.error,
                  provider: decodedData.provider
                });
              }
            } catch (decodeError) {
              console.error(`❌ Erreur décodage données:`, decodeError);
            }
          }
        }
      } catch (fetchError) {
        console.log(`⚠️ Erreur fetch ${url}:`, fetchError.message);
      }
    }
    
    // Vérifier aussi la variable globale (au cas où)
    console.log(`🔍 Vérification variable globale en fallback...`);
    
    if (global.currentAuthResult && 
        global.currentAuthResult.session_id === session_id &&
        global.currentAuthResult.timestamp > Date.now() - 10 * 60 * 1000) {
      
      console.log(`✅ Données trouvées dans variable globale pour session ${session_id}`);
      
      const result = global.currentAuthResult;
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

    // Aucune donnée trouvée
    console.log(`⏳ Aucun résultat pour session ${session_id} - en attente`);
    return res.status(200).json({
      status: 'pending',
      message: 'Authentification en cours...'
    });

  } catch (error) {
    console.error('❌ Erreur dans auth-result:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Erreur serveur: ' + error.message
    });
  }
};
