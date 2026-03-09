export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawKey = process.env.ANTHROPIC_API_KEY || "";
  const apiKey = rawKey.replace(/\s+/g, ''); 

  try {
    const { prompt, imageB64 } = req.body;

    // Pulizia dell'immagine: rimuoviamo eventuali intestazioni data:image/... se presenti
    const cleanImage = imageB64.includes('base64,') 
      ? imageB64.split('base64,')[1] 
      : imageB64;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620", // Torniamo a Sonnet, più intelligente per le immagini
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/png",
                  data: cleanImage
                }
              },
              {
                type: "text",
                text: prompt || "Analizza l'immagine e compila il planner."
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: `Claude dice: ${data.error.message}` });
    }

    // Risposta standard che l'index si aspetta
    res.status(200).json(data);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
