// Importez le SDK Admin
const admin = require('firebase-admin');

// Vérifiez si une instance de l'app est déjà initialisée pour éviter les erreurs
if (!admin.apps.length) {
  // Récupérez les credentials depuis la variable d'environnement
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountString) {
    throw new Error('La variable d\'environnement FIREBASE_SERVICE_ACCOUNT_JSON n\'est pas définie.');
  }

  // ÉTAPE CRUCIALE : Parsez la chaîne de caractères en objet JSON
  const serviceAccount = JSON.parse(serviceAccountString);

  // Correction pour les sauts de ligne de la clé privée, une source d'erreur fréquente
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

  // Initialisez le SDK Admin avec l'objet JSON parsé
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cracken-auth-default-rtdb.europe-west1.firebasedatabase.app/" // Assurez-vous que l'URL est correcte
  });
}

// Exportez l'instance admin pour l'utiliser dans vos autres fichiers
module.exports = admin;
