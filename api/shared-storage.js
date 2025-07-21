// shared-storage.js
const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      // Mets ici tes credentials Firebase Admin (service account)
      // Tu peux aussi utiliser admin.initializeApp() si tu utilises les variables d'env Vercel
    }),
    databaseURL: "https://<TON_PROJECT_ID>.firebaseio.com"
  });
}
const db = admin.database();

async function setAuthResult(sessionId, result) {
  await db.ref('oauth_sessions/' + sessionId).set({
    ...result,
    timestamp: Date.now()
  });
}

async function getAuthResult(sessionId) {
  const snap = await db.ref('oauth_sessions/' + sessionId).once('value');
  return snap.exists() ? snap.val() : null;
}

async function deleteAuthResult(sessionId) {
  await db.ref('oauth_sessions/' + sessionId).remove();
}

module.exports = { setAuthResult, getAuthResult, deleteAuthResult };
