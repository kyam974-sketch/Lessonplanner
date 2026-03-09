export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Chiave Google non configurata su Vercel' });

  try {
    const { prompt, imageB64 } = req.body;

    // Nel 2026 l'endpoint per Gemini 3 è questo:
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${apiKey}`, {
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
    
    if (data.error) throw new Error(data.error.message);

    if (data.candidates && data.candidates[0]) {
      const resultText = data.candidates[0].content.parts[0].text;
      res.status(200).json({ text: resultText });
    } else {
      throw new Error("Il modello Gemini 3 non ha restituito dati. Riprova lo scan.");
    }

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
