// api/discord-callback.js
// Callback Discord OAuth - Version corrigée avec stockage partagé

const fetch = require("node-fetch");
const { setAuthResult } = require('./shared-storage.js');

module.exports = async function handler(req, res) {
  const { code, state, error, error_description } = req.query;

  console.log('Callback Discord reçu:', { code: !!code, state, error });

  if (error) {
    console.error('Erreur Discord OAuth:', error, error_description);
    
    // Stocker l'erreur pour le polling
    if (state) {
      await setAuthResult(state, {
        success: false,
        error: error_description || error,
        provider: 'discord'
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
        provider: 'discord'
      });
    }

    return res.status(400).json({
      success: false,
      error: errorMsg
    });
  }

  try {
    console.log('Échange du code Discord contre un token...');

    // Échanger le code contre un access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://cracken-auth.vercel.app/discord-callback'
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Erreur échange token Discord:', errorText);
      
      await setAuthResult(state, {
        success: false,
        error: 'Erreur lors de l\'échange du token Discord',
        provider: 'discord'
      });

      return res.status(400).json({
        success: false,
        error: 'Erreur lors de l\'échange du token Discord'
      });
    }

    const tokenInfo = await tokenResponse.json();
    console.log('Token Discord reçu:', Object.keys(tokenInfo));

    if (!tokenInfo.access_token) {
      console.error('Access token Discord manquant');
      
      await setAuthResult(state, {
        success: false,
        error: 'Token d\'accès Discord manquant',
        provider: 'discord'
      });

      return res.status(400).json({
        success: false,
        error: 'Token d\'accès Discord manquant'
      });
    }

    // Récupérer les informations utilisateur Discord
    console.log('Récupération des informations utilisateur Discord...');
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        'Authorization': `Bearer ${tokenInfo.access_token}`
      }
    });

    if (!userResponse.ok) {
      console.error('Erreur récupération infos utilisateur Discord:', userResponse.status);
      
      await setAuthResult(state, {
        success: false,
        error: 'Impossible de récupérer les informations utilisateur Discord',
        provider: 'discord'
      });

      return res.status(400).json({
        success: false,
        error: 'Impossible de récupérer les informations utilisateur Discord'
      });
    }

    const userData = await userResponse.json();
    console.log('Données utilisateur Discord reçues:', userData.username);

    // Stocker le résultat pour le polling
    await setAuthResult(state, {
      success: true,
      email: userData.email || '',
      name: userData.username || userData.global_name || 'Utilisateur Discord',
      access_token: tokenInfo.access_token,
      provider: 'discord'
    });

    // Page de succès simple
    const successHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Connexion Discord réussie</title>
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
    <h1>✅ Connexion Discord validée</h1>
    <div class="success">Authentification réussie !</div>
    <p>Utilisateur: ${userData.username}</p>
    <p>Vous pouvez fermer cette fenêtre et retourner au launcher.</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(successHtml);

  } catch (error) {
    console.error('Erreur dans callback Discord:', error);
    
    // Stocker l'erreur pour le polling
    await setAuthResult(state, {
      success: false,
      error: 'Erreur serveur: ' + error.message,
      provider: 'discord'
    });
    
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: error.message
    });
  }
};
