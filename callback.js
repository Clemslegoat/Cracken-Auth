// Serveur de callback OAuth pour Cracken Launcher
// Déployé gratuitement sur Vercel

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
    const { code, state, error } = req.query;

    if (error) {
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
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
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
      // Succès - Rediriger vers le launcher avec le code
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
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                .countdown { font-size: 1em; opacity: 0.8; margin-top: 20px; }
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
                <h1>Connexion Google réussie !</h1>
                <p>Authentification terminée avec succès.</p>
                <p>Vous pouvez fermer cette fenêtre et retourner au Cracken Launcher.</p>
                <div class="countdown">Cette fenêtre se fermera dans <span id="countdown">3</span> secondes...</div>
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

                // Compte à rebours et fermeture
                let count = 3;
                const countdownElement = document.getElementById('countdown');
                const timer = setInterval(() => {
                    count--;
                    countdownElement.textContent = count;
                    if (count <= 0) {
                        clearInterval(timer);
                        window.close();
                    }
                }, 1000);
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
