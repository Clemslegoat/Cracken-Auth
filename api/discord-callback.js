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

    // Page de succès
    const successHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Discord Auth - Succès</title>
    <meta charset="utf-8">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #5865F2 0%, #3B4CCA 100%);
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
        <h1>Authentification Discord réussie !</h1>
        <p><strong>Nom d'utilisateur:</strong> ${userData.username}</p>
        <p><strong>Email:</strong> ${userData.email || 'Non fourni'}</p>
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
