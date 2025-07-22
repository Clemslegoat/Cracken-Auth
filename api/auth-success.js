// api/auth-success.js
// Page de succès avec données intégrées pour le polling

module.exports = async function handler(req, res) {
  const { data } = req.query;

  if (!data) {
    return res.status(400).send('Données manquantes');
  }

  try {
    // Décoder les données
    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString());
    console.log(`📄 AUTH SUCCESS: Affichage page pour session ${decodedData.session_id}`);
    console.log(`📄 AUTH SUCCESS: Succès: ${decodedData.success}, Provider: ${decodedData.provider}`);

    // Stocker temporairement dans une variable globale pour le polling
    global.currentAuthResult = {
      ...decodedData,
      timestamp: Date.now()
    };

    const isSuccess = decodedData.success;
    const title = isSuccess ? 'Connexion réussie' : 'Erreur de connexion';
    const icon = isSuccess ? '✓' : '✗';
    const bgColor = isSuccess ? '#44C283' : '#e74c3c';
    const message = isSuccess 
      ? `Bienvenue ${decodedData.data?.name || 'utilisateur'} !`
      : `Erreur: ${decodedData.error}`;

    const successHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <meta charset="utf-8">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, ${bgColor} 0%, ${isSuccess ? '#2ecc71' : '#c0392b'} 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: rgba(255,255,255,0.15);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 400px;
            margin: 20px;
        }
        .icon {
            width: 80px;
            height: 80px;
            background: ${isSuccess ? '#27ae60' : '#c0392b'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 40px;
        }
        h1 { 
            color: white; 
            margin: 20px 0;
            font-size: 28px;
            font-weight: 600;
        }
        .subtitle {
            color: rgba(255,255,255,0.9);
            margin: 15px 0;
            font-size: 16px;
        }
        .info {
            color: rgba(255,255,255,0.8);
            margin: 20px 0;
            font-size: 14px;
            line-height: 1.5;
        }
        .hidden-data {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">${icon}</div>
        <h1>${title}</h1>
        <div class="subtitle">${message}</div>
        <div class="info">Vous pouvez fermer cette fenêtre et retourner au Cracken Launcher.</div>
        
        <!-- Données cachées pour le polling -->
        <div class="hidden-data" id="auth-data">${data}</div>
        <div class="hidden-data" id="session-id">${decodedData.session_id}</div>
    </div>
    
    <script>
        // Auto-refresh pour maintenir les données en mémoire
        setTimeout(() => {
            console.log('Données d\\'authentification maintenues en mémoire');
        }, 1000);
    </script>
</body>
</html>`;

    return res.status(200).send(successHtml);

  } catch (error) {
    console.error('Erreur dans auth-success:', error);
    return res.status(500).send('Erreur lors de l\'affichage de la page de succès');
  }
};
