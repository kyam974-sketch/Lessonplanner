export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Chiave non trovata nelle variabili di Vercel' });

  try {
    const { prompt, imageB64 } = req.body;

    // Usiamo Gemini 1.5 Flash che è il più compatibile in assoluto con le chiavi standard
    const modelId = "gemini-1.5-flash";

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`, {
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
      throw new Error("Risposta vuota da Google. Riprova lo scan.");
    }

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
