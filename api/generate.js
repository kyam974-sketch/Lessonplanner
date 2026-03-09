export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Chiave mancante' });

  try {
    const { prompt, imageB64 } = req.body;

    // Usiamo gemini-3-flash con l'endpoint v1beta che è quello richiesto per i nuovi modelli
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
    
    // Se Google risponde con un errore di "modello non trovato", stampiamo cosa ha ricevuto
    if (data.error) {
      console.error("Dettaglio Errore Google:", data.error);
      throw new Error(data.error.message);
    }

    if (data.candidates && data.candidates[0]) {
      const resultText = data.candidates[0].content.parts[0].text;
      res.status(200).json({ text: resultText });
    } else {
      throw new Error("Risposta vuota da Gemini");
    }

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
