// Dans votre fonction qui gère le callback de Google
const { code, state } = req.query;

if (code) {
    try {
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code: code,
                client_id: process.env.GOOGLE_CLIENT_ID, // Lecture de la variable
                client_secret: process.env.GOOGLE_CLIENT_SECRET, // Lecture de la variable
                redirect_uri: "https://cracken-auth.vercel.app/callback",
                grant_type: "authorization_code",
            }),
        });

        // ... suite du code
        
    } catch (error) {
        // Un problème ici causera une erreur 500 si non géré
        console.error("Erreur lors de l'échange du code Google:", error);
        res.status(500).json({ success: false, message: "Erreur interne du serveur." });
    }
} else {
    res.status(400).send("Code ou state manquant.");
}
