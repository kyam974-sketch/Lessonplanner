export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) return res.status(500).json({ error: 'Chiave non caricata su Vercel.' });

  try {
    const { prompt, imageB64 } = req.body;

    // Proviamo il modello gemini-1.5-flash-latest (spesso più tollerante sulle chiavi nuove)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
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
    
    // Se Google risponde ancora "Invalid Key", allora c'è un problema di attivazione sul loro portale
    if (data.error) {
      return res.status(401).json({ error: `Google dice: ${data.error.message}` });
    }

    const resultText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ text: resultText });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
