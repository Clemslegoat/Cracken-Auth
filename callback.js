// callback.js
// Redirection vers le vrai callback dans /api/

module.exports = async function handler(req, res) {
  // Rediriger vers le vrai callback avec tous les paramètres
  const queryString = new URLSearchParams(req.query).toString();
  const redirectUrl = `/api/callback?${queryString}`;
  
  console.log('🔄 Redirection callback Google:', redirectUrl);
  
  return res.redirect(302, redirectUrl);
};
