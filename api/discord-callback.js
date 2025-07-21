const { setAuthResult } = require('./shared-storage.js');

module.exports = function handler(req, res) {
  const { code, state, error, error_description } = req.query;

  if (error) {
    if (state) {
      setAuthResult(state, {
        success: false,
        error: error_description || error,
        provider: 'discord'
      });
    }
    return res.status(400).json({ error: error_description || error });
  }

  if (!code || !state) {
    return res.status(400).json({ error: 'Code ou state manquant' });
  }

  // Stocker le résultat pour le polling
  setAuthResult(state, {
    success: true,
    code: code,
    provider: 'discord'
  });

  // Page de succès Discord
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Discord Auth - Succès</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #7289da, #5865f2); color: white; }
            .container { max-width: 500px; margin: 0 auto; background: rgba(0,0,0,0.3); padding: 30px; border-radius: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎉 Authentification Discord réussie !</h1>
            <p>Vous pouvez fermer cette fenêtre.</p>
        </div>
    </body>
    </html>
  `);
}
