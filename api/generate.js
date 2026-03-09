export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  // Usiamo la variabile che hai salvato nelle Environment Variables (Screenshot 1)
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Errore: GOOGLE_API_KEY non trovata su Vercel.' });
  }

  try {
    const { prompt, imageB64 } = req.body;

    // Chiamata DIRETTA a Google. Usiamo Gemini 1.5 Flash perché è il più veloce e stabile.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
      throw new Error(data.error.message);
    }

    // Estraiamo il testo e lo mandiamo al Planner
    if (data.candidates && data.candidates[0].content) {
      const resultText = data.candidates[0].content.parts[0].text;
      res.status(200).json({ text: resultText });
    } else {
      throw new Error("Google non ha restituito testo. Riprova lo scan.");
    }

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
