// api/discord-callback.js
// Gère le callback Discord OAuth pour Cracken Launcher

// Stockage temporaire en mémoire (pour la démo)
// En production, utilisez Redis ou une base de données
const authResults = new Map();

// Nettoyer les anciens résultats (expire après 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of authResults.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) { // 10 minutes
      authResults.delete(key);
    }
  }
}, 60 * 1000); // Nettoyer chaque minute

export default function handler(req, res) {
  // Configurer CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { code, state, error, error_description } = req.query;

    console.log('Discord callback reçu:', { code: !!code, state, error });

    if (error) {
      // Erreur d'autorisation Discord
      console.error('Erreur Discord OAuth:', error, error_description);
      
      // Stocker l'erreur pour le polling
      if (state) {
        authResults.set(state, {
          success: false,
          error: error_description || error,
          timestamp: Date.now()
        });
      }

      // Rediriger vers une page d'erreur ou afficher un message
      res.status(400).json({
        success: false,
        error: error_description || error,
        message: 'Erreur lors de l\'autorisation Discord'
      });
      return;
    }

    if (!code || !state) {
      console.error('Code ou state manquant:', { code: !!code, state: !!state });
      res.status(400).json({
        success: false,
        error: 'Paramètres manquants',
        message: 'Code d\'autorisation ou state manquant'
      });
      return;
    }

    // Stocker le résultat pour le polling
    authResults.set(state, {
      success: true,
      code: code,
      timestamp: Date.now(),
      provider: 'discord'
    });

    console.log(`Résultat Discord stocké pour session: ${state}`);

    // Afficher une page de succès
    const successHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Connexion Discord Réussie</title>
        <meta charset="utf-8">
        <style>
            body {
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #5865F2, #4752C4);
                color: white;
                text-align: center;
                padding: 50px;
                margin: 0;
            }
            .container {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                padding: 40px;
                max-width: 500px;
                margin: 0 auto;
                backdrop-filter: blur(10px);
            }
            .icon {
                font-size: 64px;
                margin-bottom: 20px;
            }
            h1 {
                margin: 0 0 20px 0;
                font-size: 28px;
            }
            p {
                font-size: 16px;
                line-height: 1.5;
                margin: 0 0 30px 0;
            }
            .launcher-name {
                color: #44C283;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">🎮</div>
            <h1>Connexion Discord Réussie !</h1>
            <p>Votre compte Discord a été connecté avec succès au <span class="launcher-name">Cracken Launcher</span>.</p>
            <p>Vous pouvez maintenant fermer cette fenêtre et retourner au launcher.</p>
        </div>
        <script>
            // Optionnel: fermer automatiquement après 3 secondes
            setTimeout(() => {
                window.close();
            }, 3000);
        </script>
    </body>
    </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(successHtml);

  } catch (error) {
    console.error('Erreur dans discord-callback:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: 'Une erreur interne s\'est produite'
    });
  }
}

// Exporter aussi la Map pour les autres modules (si nécessaire)
export { authResults };
