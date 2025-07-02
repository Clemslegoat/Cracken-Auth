// Serveur de callback OAuth pour Cracken Launcher
// Déployé gratuitement sur Vercel

// Stockage temporaire des résultats d'authentification (en mémoire)
// Note: En production, utilisez une base de données ou Redis
let authResults = new Map();

// Nettoyer les anciens résultats (plus de 5 minutes)
function cleanupOldResults() {
  const now = Date.now();
  for (const [key, value] of authResults.entries()) {
    if (now - value.timestamp > 5 * 60 * 1000) { // 5 minutes
      authResults.delete(key);
    }
  }
}

export default function handler(req, res) {
  // Permettre les requêtes depuis n'importe quelle origine (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const { code, state, error, action, session_id } = req.query;

    // Nettoyer les anciens résultats
    cleanupOldResults();

    // Endpoint pour que le launcher récupère le résultat d'authentification
    if (action === 'poll' && session_id) {
      const result = authResults.get(session_id);
      if (result) {
        authResults.delete(session_id); // Nettoyer après récupération
        res.status(200).json(result);
      } else {
        res.status(202).json({ status: 'waiting' }); // Toujours en attente
      }
      return;
    }

    if (error) {
      // Stocker l'erreur si on a un state (session_id)
      if (state) {
        authResults.set(state, {
          success: false,
          error: error,
          timestamp: Date.now()
        });
      }

      // Erreur d'authentification
      const errorHtml = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Erreur d'authentification</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #0B1317 0%, #44C283 100%);
                    color: white;
                    text-align: center;
                    padding: 50px 20px;
                    margin: 0;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .container {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    max-width: 500px;
                }
                h1 { font-size: 2.5em; margin-bottom: 20px; }
                p { font-size: 1.2em; line-height: 1.6; }
                .error-icon { font-size: 4em; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="error-icon">❌</div>
                <h1>Erreur d'authentification</h1>
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

    if (code) {
      // Stocker le code d'autorisation avec le state comme clé de session
      if (state) {
        authResults.set(state, {
          success: true,
          code: code,
          state: state,
          timestamp: Date.now()
        });
      }

      // Succès - Afficher la page de confirmation
      const successHtml = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Connexion Google réussie</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #0B1317 0%, #44C283 100%);
                    color: white;
                    text-align: center;
                    padding: 50px 20px;
                    margin: 0;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .container {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    max-width: 500px;
                }
                h1 { font-size: 2.5em; margin-bottom: 20px; }
                p { font-size: 1.2em; line-height: 1.6; margin-bottom: 20px; }
                .checkmark { font-size: 4em; margin-bottom: 20px; animation: bounce 1s ease-in-out; }

                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-10px); }
                    60% { transform: translateY(-5px); }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="checkmark">✅</div>
                <h1>Connexion Google<br>réussie !</h1>
                <p>Authentification terminée avec succès.</p>
                <p>Vous pouvez fermer cette fenêtre et retourner au Cracken Launcher.</p>

            </div>
            <script>
                // Envoyer le code au launcher via localStorage (si même domaine) ou postMessage
                try {
                    // Essayer de communiquer avec le launcher
                    if (window.opener) {
                        window.opener.postMessage({
                            type: 'GOOGLE_AUTH_SUCCESS',
                            code: '${code}',
                            state: '${state || ''}'
                        }, '*');
                    }
                } catch (e) {
                    console.log('Communication avec le launcher impossible:', e);
                }

                // Authentification terminée - pas de fermeture automatique
                console.log('Authentification Google terminée avec succès');
            </script>
        </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(successHtml);
      return;
    }

    // Aucun code reçu
    res.status(400).json({ error: 'Aucun code d\'autorisation reçu' });
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
