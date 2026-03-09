export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Chiave Google mancante' });

  try {
    const { prompt, imageB64 } = req.body;

    // Usiamo il nome completo della tabella Vercel 2026
    const modelName = "google/gemini-3-flash";

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/png", data: imageB64 } }
          ]
        }]
      })
    });

    const data = await response.json();
    
    // Se fallisce, proviamo la versione v1beta automaticamente senza fermarci
    if (data.error) {
      const retry = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: "image/png", data: imageB64 } }
            ]
          }]
        })
      });
      const retryData = await retry.json();
      if (retryData.error) throw new Error(retryData.error.message);
      return res.status(200).json({ text: retryData.candidates[0].content.parts[0].text });
    }

    if (data.candidates && data.candidates[0]) {
      res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
      throw new Error("Nessuna risposta dal modello.");
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
