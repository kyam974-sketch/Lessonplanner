export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Manca GOOGLE_API_KEY' });

  try {
    const { prompt, imageB64 } = req.body;

    // Proviamo la versione 8b, la più permissiva di tutte
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }, { inline_data: { mime_type: "image/png", data: imageB64 } }]
        }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    res.status(200).json({ text: data.candidates[0].content.parts[0].text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
