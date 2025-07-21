const fetch = require("node-fetch"); // ✅ Tout en haut

module.exports = async function handler(req, res) {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).send("Code ou state manquant.");
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "https://cracken-auth.vercel.app/callback",
        grant_type: "authorization_code"
      })
    });

    // Traitement de la réponse
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur lors de l'échange du code Google:", error);
    res.status(500).json({ success: false });
  }
};
