// api/callback.js
// Callback Google OAuth - Version corrigée avec stockage partagé

const fetch = require("node-fetch");
const { setAuthResult } = require('./shared-storage.js');

module.exports = async function handler(req, res) {
  const { code, state, error, error_description } = req.query;

  console.log('Callback Google reçu:', { code: !!code, state, error });

  if (error) {
    console.error('Erreur Google OAuth:', error, error_description);
    
    // Stocker l'erreur pour le polling
    if (state) {
      await setAuthResult(state, {
        success: false,
        error: error_description || error,
        provider: 'google'
      });
    }

    return res.status(400).json({
      success: false,
      error: error_description || error
    });
  }

  if (!code || !state) {
    const errorMsg = 'Code ou state manquant';
    console.error(errorMsg);
    
    if (state) {
      await setAuthResult(state, {
        success: false,
        error: errorMsg,
        provider: 'google'
      });
    }

    return res.status(400).json({
      success: false,
      error: errorMsg
    });
  }

  try {
    console.log('Échange du code Google contre un token...');

    // Échanger le code contre un access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "https://cracken-auth.vercel.app/callback",
        grant_type: "authorization_code"
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Erreur échange token Google:', errorText);
      
      await setAuthResult(state, {
        success: false,
        error: 'Erreur lors de l\'échange du token',
        provider: 'google'
      });

      return res.status(400).json({
        success: false,
        error: 'Erreur lors de l\'échange du token'
      });
    }

    const tokenInfo = await tokenResponse.json();
    console.log('Token Google reçu:', Object.keys(tokenInfo));

    if (!tokenInfo.access_token) {
      console.error('Access token manquant dans la réponse');
      
      await setAuthResult(state, {
        success: false,
        error: 'Token d\'accès manquant',
        provider: 'google'
      });

      return res.status(400).json({
        success: false,
        error: 'Token d\'accès manquant'
      });
    }

    // Récupérer les informations utilisateur
    console.log('Récupération des informations utilisateur Google...');
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenInfo.access_token}`);

    if (!userResponse.ok) {
      console.error('Erreur récupération infos utilisateur:', userResponse.status);
      
      await setAuthResult(state, {
        success: false,
        error: 'Impossible de récupérer les informations utilisateur',
        provider: 'google'
      });

      return res.status(400).json({
        success: false,
        error: 'Impossible de récupérer les informations utilisateur'
      });
    }

    const userData = await userResponse.json();
    console.log('Données utilisateur Google reçues:', userData.email);

    // Stocker le résultat pour le polling
    await setAuthResult(state, {
      success: true,
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      access_token: tokenInfo.access_token,
      provider: 'google'
    });

    // Page de succès
    const successHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Google Auth - Succès</title>
    <meta charset="utf-8">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
        }
        .container {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 15px;
            max-width: 500px;
            margin: 0 auto;
            backdrop-filter: blur(10px);
        }
        h1 { color: #4CAF50; margin-bottom: 20px; }
        .info { margin: 20px 0; font-size: 14px; opacity: 0.9; }
        .success-icon { font-size: 48px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">🎉</div>
        <h1>Authentification Google réussie !</h1>
        <p><strong>Email:</strong> ${userData.email}</p>
        <p><strong>Nom:</strong> ${userData.name || 'Non fourni'}</p>
        <p><strong>Session:</strong> ${state}</p>
        <div class="info">
            <p>✅ Vous pouvez fermer cette fenêtre</p>
            <p>🔄 Retournez au Cracken Launcher</p>
        </div>
    </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(successHtml);

  } catch (error) {
    console.error('Erreur dans callback Google:', error);
    
    // Stocker l'erreur pour le polling
    await setAuthResult(state, {
      success: false,
      error: 'Erreur serveur: ' + error.message,
      provider: 'google'
    });
    
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: error.message
    });
  }
};
