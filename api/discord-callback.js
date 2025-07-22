// api/discord-callback.js
// Callback Discord OAuth - Version finale avec redirection vers page de succès

const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  const { code, state, error, error_description } = req.query;

  console.log('🔗 CALLBACK DISCORD reçu:', { code: !!code, state, error });
  console.log('🆔 CALLBACK DISCORD - Session ID reçu:', state);

  if (error) {
    console.error('Erreur Discord OAuth:', error, error_description);
    
    const errorData = {
      success: false,
      error: error_description || error,
      provider: 'discord',
      session_id: state
    };
    
    const encodedError = Buffer.from(JSON.stringify(errorData)).toString('base64');
    return res.redirect(`/api/auth-success?data=${encodedError}`);
  }

  if (!code || !state) {
    const errorMsg = 'Code ou state manquant';
    console.error(errorMsg);
    
    const errorData = {
      success: false,
      error: errorMsg,
      provider: 'discord',
      session_id: state
    };
    
    const encodedError = Buffer.from(JSON.stringify(errorData)).toString('base64');
    return res.redirect(`/api/auth-success?data=${encodedError}`);
  }

  try {
    console.log('Échange du code Discord contre un token...');

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: '1320493893568331806',
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://cracken-auth.vercel.app/discord-callback'
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Erreur échange token Discord:', errorText);
      
      const errorData = {
        success: false,
        error: 'Erreur lors de l\'échange du token Discord',
        provider: 'discord',
        session_id: state
      };
      
      const encodedError = Buffer.from(JSON.stringify(errorData)).toString('base64');
      return res.redirect(`/api/auth-success?data=${encodedError}`);
    }

    const tokenInfo = await tokenResponse.json();
    console.log('Token Discord reçu:', Object.keys(tokenInfo));

    if (!tokenInfo.access_token) {
      console.error('Access token Discord manquant dans la réponse');
      
      const errorData = {
        success: false,
        error: 'Token d\'accès Discord manquant',
        provider: 'discord',
        session_id: state
      };
      
      const encodedError = Buffer.from(JSON.stringify(errorData)).toString('base64');
      return res.redirect(`/api/auth-success?data=${encodedError}`);
    }

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        'Authorization': `Bearer ${tokenInfo.access_token}`
      }
    });

    if (!userResponse.ok) {
      console.error('Erreur récupération infos utilisateur Discord:', userResponse.status);
      
      const errorData = {
        success: false,
        error: 'Impossible de récupérer les informations utilisateur Discord',
        provider: 'discord',
        session_id: state
      };
      
      const encodedError = Buffer.from(JSON.stringify(errorData)).toString('base64');
      return res.redirect(`/api/auth-success?data=${encodedError}`);
    }

    const userData = await userResponse.json();
    console.log('Données utilisateur Discord reçues:', userData.username);

    console.log(`📝 CALLBACK: Préparation des données Discord pour session ${state}`);
    
    const successData = {
      success: true,
      data: {
        email: userData.email || '',
        name: userData.username || userData.global_name || 'Utilisateur Discord',
        access_token: tokenInfo.access_token
      },
      provider: 'discord',
      session_id: state
    };
    
    const encodedData = Buffer.from(JSON.stringify(successData)).toString('base64');
    console.log(`✅ CALLBACK: Redirection vers page de succès Discord pour session ${state}`);
    
    return res.redirect(`/api/auth-success?data=${encodedData}`);

  } catch (error) {
    console.error('Erreur dans callback Discord:', error);
    
    const errorData = {
      success: false,
      error: 'Erreur serveur: ' + error.message,
      provider: 'discord',
      session_id: state
    };
    
    const encodedError = Buffer.from(JSON.stringify(errorData)).toString('base64');
    return res.redirect(`/api/auth-success?data=${encodedError}`);
  }
};
