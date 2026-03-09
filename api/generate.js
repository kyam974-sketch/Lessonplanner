export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  // Prendiamo la chiave e puliamola da eventuali spazi o ritorni a capo invisibili
  const rawKey = process.env.GEMINI_PLANNER_KEY || "";
  const key = rawKey.trim();
  
  if (!key) {
    return res.status(500).json({ error: 'Chiave GEMINI_PLANNER_KEY non trovata. Controlla Environment Variables su Vercel.' });
  }

  try {
    const { prompt, imageB64 } = req.body;

    // Endpoint ultra-specifico per il 2026
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

    const response = await fetch(url, {
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
    
    // Se c'è un errore, lo mostriamo chiaramente
    if (data.error) {
      return res.status(data.error.code || 400).json({ 
        error: `Google dice: ${data.error.message} (Codice: ${data.error.status})` 
      });
    }

    if (data.candidates && data.candidates[0].content) {
      res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
      res.status(500).json({ error: "Risposta vuota da Google. Prova a ricaricare." });
    }

  } catch (err) {
    res.status(500).json({ error: `Errore Server: ${err.message}` });
  }
}
