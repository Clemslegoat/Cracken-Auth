export default async function handler(req, res) {
  const binId = process.env.JSONBIN_BIN_ID;
  const apiKey = process.env.JSONBIN_API_KEY;

  const url = `https://api.jsonbin.io/v3/b/${binId}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Master-Key': apiKey
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message });
    }

    res.status(200).json(data.record);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}