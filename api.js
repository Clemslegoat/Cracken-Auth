// Cracken Launcher OAuth Callback
export default function handler(req, res) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const { code, state, error } = req.query;

    // Page d'erreur
    if (error) {
      const errorPage = `
        <!DOCTYPE html>
        <html>
        <head><title>Erreur OAuth</title></head>
        <body style="font-family:Arial;text-align:center;padding:50px;background:linear-gradient(135deg,#ff6b6b,#ee5a24);color:white;">
          <h1>❌ Erreur d'authentification Google</h1>
          <p>Une erreur s'est produite lors de la connexion.</p>
          <p>Veuillez fermer cette fenêtre et réessayer dans le launcher.</p>
        </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(400).send(errorPage);
      return;
    }

    // Page de succès
    if (code) {
      const successPage = `
        <!DOCTYPE html>
        <html>
        <head><title>Connexion Réussie</title></head>
        <body style="font-family:Arial;text-align:center;padding:50px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;">
          <h1>✅ Connexion Google réussie !</h1>
          <p>Authentification terminée avec succès.</p>
          <p>Vous pouvez fermer cette fenêtre et retourner au Cracken Launcher.</p>
          <p id="countdown">Cette fenêtre se fermera dans 3 secondes...</p>
          <script>
            let count = 3;
            const timer = setInterval(() => {
              count--;
              document.getElementById('countdown').textContent = 'Cette fenêtre se fermera dans ' + count + ' secondes...';
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
      res.status(200).send(successPage);
      return;
    }

    // Page par défaut
    const defaultPage = `
      <!DOCTYPE html>
      <html>
      <head><title>Cracken OAuth Server</title></head>
      <body style="font-family:Arial;text-align:center;padding:50px;background:#667eea;color:white;">
        <h1>🚀 Cracken Launcher OAuth Server</h1>
        <p>✅ Serveur en ligne et fonctionnel</p>
        <p>Endpoint: /callback pour les callbacks Google OAuth</p>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(defaultPage);
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
