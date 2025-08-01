// api/auth-success.js
// Page de succès avec données intégrées pour le polling

module.exports = async function handler(req, res) {
  const { data, session_check } = req.query;

  // Si c'est une vérification de session, retourner les données stockées
  if (session_check) {
    console.log(`🔍 AUTH SUCCESS: Vérification session ${session_check}`);

    if (global.currentAuthResult &&
        global.currentAuthResult.session_id === session_check &&
        global.currentAuthResult.timestamp > Date.now() - 10 * 60 * 1000) {

      console.log(`✅ AUTH SUCCESS: Données trouvées pour vérification ${session_check}`);

      const result = global.currentAuthResult;
      const encodedData = Buffer.from(JSON.stringify(result)).toString('base64');

      // Retourner une page HTML simple avec les données
      const html = `
<!DOCTYPE html>
<html>
<head><title>Auth Check</title></head>
<body>
    <div class="hidden-data" id="auth-data">${encodedData}</div>
    <div class="hidden-data" id="session-id">${session_check}</div>
</body>
</html>`;

      return res.status(200).send(html);
    }

    console.log(`❌ AUTH SUCCESS: Aucune donnée pour vérification ${session_check}`);
    return res.status(404).send('Session non trouvée');
  }

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
    const title = isSuccess ? '✓ Connexion réussie !' : '✗ Erreur de connexion';
    const bgColor = isSuccess ? '#44C283' : '#e74c3c';

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
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 350px;
            margin: 20px;
        }
        h1 { 
            color: white; 
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .error-message {
            color: rgba(255,255,255,0.9);
            margin: 15px 0 0 0;
            font-size: 16px;
        }
        .info {
            color: rgba(255,255,255,0.8);
            margin: 20px 0 0 0;
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
        <h1>${title}</h1>
        ${isSuccess ? '' : `<div class="error-message">${decodedData.error}</div>`}
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
