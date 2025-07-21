const admin = require('firebase-admin');

if (!admin.apps.length) {
  const {
    FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY_ID,
    FIREBASE_CLIENT_ID,
    FIREBASE_AUTH_URI,
    FIREBASE_TOKEN_URI,
    FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    FIREBASE_CLIENT_X509_CERT_URL,
    FIREBASE_DATABASE_URL,
  } = process.env;

  if (
    !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PROJECT_ID ||
    !FIREBASE_PRIVATE_KEY_ID || !FIREBASE_CLIENT_ID || !FIREBASE_AUTH_URI ||
    !FIREBASE_TOKEN_URI || !FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||
    !FIREBASE_CLIENT_X509_CERT_URL || !FIREBASE_DATABASE_URL
  ) {
    throw new Error('Une ou plusieurs variables d’environnement Firebase sont manquantes.');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: FIREBASE_PROJECT_ID,
      private_key_id: FIREBASE_PRIVATE_KEY_ID,
      private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: FIREBASE_CLIENT_EMAIL,
      client_id: FIREBASE_CLIENT_ID,
      auth_uri: FIREBASE_AUTH_URI,
      token_uri: FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: FIREBASE_CLIENT_X509_CERT_URL,
    }),
    databaseURL: FIREBASE_DATABASE_URL,
  });
}

module.exports = admin;
