export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Google API key not configured' });

  try {
    const { prompt, imageB64 } = req.body;

    // Sintassi alternativa per il modello Flash v1
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
    
    if (data.error) {
        // Se ricevi ancora l'errore del modello, proviamo a usare il Pro, che a volte è l'unico attivo
        const retryResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
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
        const retryData = await retryResponse.json();
        if (retryData.error) throw new Error(retryData.error.message);
        return res.status(200).json({ text: retryData.candidates[0].content.parts[0].text });
    }

    res.status(200).json({ text: data.candidates[0].content.parts[0].text });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
