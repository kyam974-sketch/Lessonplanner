export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  // Usiamo il nuovo nome della variabile per evitare conflitti
  const key = process.env.GEMINI_PLANNER_KEY;
  
  if (!key) {
    return res.status(500).json({ error: 'Manca la chiave GEMINI_PLANNER_KEY su Vercel' });
  }

  try {
    const { prompt, imageB64 } = req.body;

    // Chiamata diretta a Google con il modello più stabile
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
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
      return res.status(401).json({ error: `Google dice: ${data.error.message}` });
    }

    if (data.candidates && data.candidates[0].content) {
      const output = data.candidates[0].content.parts[0].text;
      res.status(200).json({ text: output });
    } else {
      throw new Error("Nessun testo generato.");
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
