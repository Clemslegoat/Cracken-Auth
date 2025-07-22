// api/index.js
// Page d'accueil du serveur OAuth Cracken Launcher - Version corrigée

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
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #0B1317 0%, #44C283 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            max-width: 600px;
            margin: 20px;
        }
        .logo {
            font-size: 48px;
            margin-bottom: 20px;
        }
        h1 {
            color: #44C283;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .subtitle {
            color: #ecf0f1;
            margin-bottom: 30px;
            font-size: 1.2em;
        }
        .status {
            background: #27ae60;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
        }
        .endpoints {
            text-align: left;
            background: rgba(0,0,0,0.2);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .endpoint {
            margin: 10px 0;
            font-family: 'Courier New', monospace;
            background: rgba(255,255,255,0.1);
            padding: 8px 12px;
            border-radius: 5px;
            font-size: 14px;
        }
        .method {
            color: #3498db;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            font-size: 14px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎮</div>
        <h1>Cracken Launcher</h1>
        <div class="subtitle">Serveur d'Authentification OAuth</div>
        
        <div class="status">✅ Serveur Opérationnel</div>
        
        <div class="endpoints">
            <h3>🔗 Endpoints Disponibles:</h3>
            
            <div class="endpoint">
                <span class="method">GET</span> / - Page d'accueil
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> /callback - Callback Google OAuth
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> /discord-callback - Callback Discord OAuth
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> /api/check-google-auth/[session_id] - Polling Google
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> /api/check-discord-auth/[session_id] - Polling Discord
            </div>
        </div>
        
        <div class="footer">
            🚀 Déployé sur Vercel | 🔒 Sécurisé avec OAuth 2.0<br>
            🔧 Version corrigée avec polling unifié
        </div>
    </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};
