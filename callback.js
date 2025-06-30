// Cracken Launcher OAuth Server - Fichier unique sans dossiers
export default function handler(req, res) {
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
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Erreur OAuth</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                    color: white;
                    text-align: center;
                    padding: 50px;
                    margin: 0;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .container {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 500px;
                    margin: 0 auto;
                }
                h1 { font-size: 2.5em; margin-bottom: 20px; }
                p { font-size: 1.2em; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>❌ Erreur d'authentification</h1>
                <p>Une erreur s'est produite lors de la connexion Google.</p>
                <p>Veuillez fermer cette fenêtre et réessayer.</p>
            </div>
        </body>
        </html>
      `);
      return;
    }

    if (code) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Connexion Réussie</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    text-align: center;
                    padding: 50px;
                    margin: 0;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .container {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 500px;
                    margin: 0 auto;
                }
                h1 { font-size: 2.5em; margin-bottom: 20px; }
                p { font-size: 1.2em; margin-bottom: 20px; }
                .countdown { font-size: 1em; opacity: 0.8; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>✅ Connexion Google réussie !</h1>
                <p>Authentification terminée avec succès.</p>
                <p>Vous pouvez fermer cette fenêtre et retourner au Cracken Launcher.</p>
                <div class="countdown">Cette fenêtre se fermera dans <span id="countdown">3</span> secondes...</div>
            </div>
            <script>
                try {
                    if (window.opener) {
                        window.opener.postMessage({
                            type: 'GOOGLE_AUTH_SUCCESS',
                            code: '${code}',
                            state: '${state || ''}'
                        }, '*');
                    }
                } catch (e) {
                    console.log('Communication impossible:', e);
                }

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
      `);
      return;
    }

    // Page d'accueil
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>Cracken OAuth Server</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background: linear-gradient(135deg, #667eea, #764ba2);
                  color: white;
                  text-align: center;
                  padding: 50px;
                  margin: 0;
                  min-height: 100vh;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
              }
              .container {
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: 20px;
                  padding: 40px;
                  max-width: 600px;
                  margin: 0 auto;
              }
              h1 { font-size: 2.5em; margin-bottom: 20px; }
              p { font-size: 1.2em; margin-bottom: 20px; }
              .status { color: #4CAF50; font-weight: bold; }
              .endpoint { 
                  background: rgba(255, 255, 255, 0.2);
                  padding: 10px;
                  border-radius: 10px;
                  font-family: monospace;
                  margin: 10px 0;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>🚀 Cracken Launcher OAuth Server</h1>
              <p class="status">✅ Serveur en ligne et fonctionnel</p>
              <p>Ce serveur gère les callbacks Google OAuth pour le Cracken Launcher.</p>
              
              <h3>📡 Endpoint disponible :</h3>
              <div class="endpoint">/callback - Callback OAuth Google</div>
              
              <p><strong>Status :</strong> <span class="status">Actif</span></p>
              
              <p style="font-size: 0.9em; opacity: 0.8; margin-top: 30px;">
                  Développé pour le Cracken Launcher<br>
                  Hébergé gratuitement sur Vercel
              </p>
          </div>
      </body>
      </html>
    `);
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
