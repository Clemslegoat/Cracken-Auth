// api/callback.js
// Callback Google OAuth - Version finale avec redirection vers page de succès

const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  const { code, state, error, error_description } = req.query;

  console.log('🔗 CALLBACK GOOGLE reçu:', { code: !!code, state, error });
  console.log('🆔 CALLBACK GOOGLE - Session ID reçu:', state);

  if (error) {
    console.error('Erreur Google OAuth:', error, error_description);
    
    // Rediriger vers une page d'erreur avec les détails
    const errorData = {
      success: false,
      error: error_description || error,
      provider: 'google',
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
      provider: 'google',
      session_id: state
    };
    
    const encodedError = Buffer.from(JSON.stringify(errorData)).toString('base64');
    return res.redirect(`/api/auth-success?data=${encodedError}`);
  }

  try {
    console.log('Échange du code Google contre un token...');

    // Échanger le code contre un token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: '190741178779-6dg1dfhsklmtbssqtt96vpqb7hq88196.apps.googleusercontent.com',
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://cracken-auth.vercel.app/callback'
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Erreur échange token Google:', errorText);
      
      const errorData = {
        success: false,
        error: 'Erreur lors de l\'échange du token',
        provider: 'google',
        session_id: state
      };
      
      const encodedError = Buffer.from(JSON.stringify(errorData)).toString('base64');
      return res.redirect(`/api/auth-success?data=${encodedError}`);
    }

    const tokenInfo = await tokenResponse.json();
    console.log('Token Google reçu:', Object.keys(tokenInfo));

    if (!tokenInfo.access_token) {
      console.error('Access token manquant dans la réponse');
      
      const errorData = {
        success: false,
        error: 'Token d\'accès manquant',
        provider: 'google',
        session_id: state
      };
      
      const encodedError = Buffer.from(JSON.stringify(errorData)).toString('base64');
      return res.redirect(`/api/auth-success?data=${encodedError}`);
    }

    // Récupérer les informations utilisateur
    console.log('Récupération des informations utilisateur Google...');
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenInfo.access_token}`
      }
    });

    if (!userResponse.ok) {
      console.error('Erreur récupération infos utilisateur Google:', userResponse.status);
      
      const errorData = {
        success: false,
        error: 'Impossible de récupérer les informations utilisateur',
        provider: 'google',
        session_id: state
      };
      
      const encodedError = Buffer.from(JSON.stringify(errorData)).toString('base64');
      return res.redirect(`/api/auth-success?data=${encodedError}`);
    }

    const userData = await userResponse.json();
    console.log('Données utilisateur Google reçues:', userData.email);

    // Créer les données de succès
    console.log(`📝 CALLBACK: Préparation des données pour session ${state}`);
    
    const successData = {
      success: true,
      data: {
        email: userData.email,
        name: userData.name || userData.email.split('@')[0],
        access_token: tokenInfo.access_token
      },
      provider: 'google',
      session_id: state
    };
    
    // Encoder les données et rediriger vers la page de succès
    const encodedData = Buffer.from(JSON.stringify(successData)).toString('base64');
    console.log(`✅ CALLBACK: Redirection vers page de succès pour session ${state}`);
    
    return res.redirect(`/api/auth-success?data=${encodedData}`);

  } catch (error) {
    console.error('Erreur dans callback Google:', error);
    
    const errorData = {
      success: false,
      error: 'Erreur serveur: ' + error.message,
      provider: 'google',
      session_id: state
    };
    
    const encodedError = Buffer.from(JSON.stringify(errorData)).toString('base64');
    return res.redirect(`/api/auth-success?data=${encodedError}`);
  }
};
