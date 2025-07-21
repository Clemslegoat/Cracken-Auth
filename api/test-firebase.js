const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}
const db = admin.database();

module.exports = async function handler(req, res) {
  try {
    await db.ref('test').set({ hello: 'world', ts: Date.now() });
    const snap = await db.ref('test').once('value');
    res.status(200).json({ data: snap.val() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
