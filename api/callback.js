const { setAuthResult } = require('./shared-storage.js');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { code, state, error, error_description } = req.query;

  if (error) {
    if (state) {
      setAuthResult(state, {
        success: false,
        error: error_description || error,
        provider: 'google'
      });
    }
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Erreur d'authentification</title>
          <style>
              body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #0B1317 0%, #44C283 100%); color: white; text-align: center; padding: 50px; }
              .container { background: rgba(255,255,255,0.1); border-radius: 15px; padding: 40px; max-width: 500px; margin: 0 auto; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>❌ Erreur d'authentification Google</h1>
              <p>Une erreur s'est produite lors de la connexion Google.</p>
              <p>Veuillez fermer cette fenêtre et réessayer.</p>
          </div>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(400).send(errorHtml);
    return;
  }

  if (!code || !state) {
    res.status(400).json({ error: 'Code ou state manquant' });
    return;
  }

  setAuthResult(state, {
    success: true,
    code: code,
    provider: 'google'
  });

  const successHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Connexion Google réussie</title>
        <style>
            body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #0B1317 0%, #44C283 100%); color: white; text-align: center; padding: 50px; }
            .container { background: rgba(255,255,255,0.1); border-radius: 15px; padding: 40px; max-width: 500px; margin: 0 auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>✅ Connexion Google réussie !</h1>
            <p>Authentification terminée avec succès.</p>
            <p>Vous pouvez fermer cette fenêtre et retourner au Cracken Launcher.</p>
        </div>
    </body>
    </html>
  `;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(successHtml);
};
