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

    // Page de succès simple
    const successHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Connexion Google réussie</title>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: #0B1317;
            color: white;
            margin: 0;
        }
        h1 { color: #44C283; margin-bottom: 20px; }
        p { margin: 10px 0; }
        .success { color: #44C283; font-size: 18px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>✅ Connexion Google validée</h1>
    <div class="success">Authentification réussie !</div>
    <p>Email: ${userData.email}</p>
    <p>Vous pouvez fermer cette fenêtre et retourner au launcher.</p>
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
