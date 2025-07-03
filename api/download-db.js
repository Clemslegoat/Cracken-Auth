export default async function handler(req, res) {
  const apiKey = process.env.JSONBIN_API_KEY;
  const binId = process.env.JSONBIN_BIN_ID;

  if (!apiKey || !binId) {
    return res.status(500).json({ error: "API key or bin ID is missing." });
  }

  const url = `https://api.jsonbin.io/v3/b/${binId}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Master-Key': apiKey
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ JSONBin error:", data);
      return res.status(response.status).json({ error: data.message || data });
    }

    res.status(200).json(data.record);
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
