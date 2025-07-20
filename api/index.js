// api/index.js
// Page d'accueil du serveur OAuth Cracken Launcher

module.exports = function handler(req, res) {
  // Configurer CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // HTML de la page d'accueil
  const html = `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cracken Launcher OAuth Server</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #0B1317, #44C283);
              color: white;
              text-align: center;
              padding: 0;
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
          }
          .container {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 20px;
              padding: 60px;
              max-width: 600px;
              backdrop-filter: blur(15px);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }
          .logo {
              font-size: 72px;
              margin-bottom: 30px;
          }
          h1 {
              margin: 0 0 20px 0;
              font-size: 36px;
              font-weight: 300;
          }
          .subtitle {
              font-size: 18px;
              opacity: 0.8;
              margin-bottom: 40px;
          }
          .status {
              background: rgba(68, 194, 131, 0.2);
              border: 1px solid #44C283;
              border-radius: 10px;
              padding: 20px;
              margin: 30px 0;
          }
          .status-icon {
              font-size: 24px;
              margin-right: 10px;
          }
          .endpoints {
              text-align: left;
              background: rgba(0, 0, 0, 0.2);
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
          }
          .endpoint {
              font-family: 'Courier New', monospace;
              font-size: 14px;
              margin: 8px 0;
              opacity: 0.9;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="logo">🎮</div>
          <h1>Cracken Launcher</h1>
          <div class="subtitle">Serveur d'Authentification OAuth</div>
          
          <div class="status">
              <span class="status-icon">✅</span>
              <strong>Serveur Opérationnel</strong>
          </div>
          
          <div class="endpoints">
              <div style="font-weight: bold; margin-bottom: 15px;">🔗 Endpoints Disponibles:</div>
              <div class="endpoint">GET  / - Page d'accueil</div>
              <div class="endpoint">GET  /callback - Callback Google OAuth</div>
              <div class="endpoint">GET  /discord-callback - Callback Discord OAuth</div>
              <div class="endpoint">GET  /api/check-discord-auth/[session_id] - Polling Discord</div>
          </div>
          
          <div style="margin-top: 40px; font-size: 14px; opacity: 0.7;">
              🚀 Déployé sur Vercel | 🔒 Sécurisé avec OAuth 2.0
          </div>
      </div>
  </body>
  </html>
  `;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};
