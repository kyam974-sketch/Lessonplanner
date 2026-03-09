export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawKey = process.env.ANTHROPIC_API_KEY || "";
  const apiKey = rawKey.replace(/\s+/g, ''); 

  try {
    const { prompt, imageB64 } = req.body;

    // Ricostruiamo la struttura 'messages' che Claude esige (Field required risolto qui)
    const anthropicPayload = {
      model: "claude-3-haiku-20240307", // Il più veloce per i test
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
                data: imageB64
              }
            },
            {
              type: "text",
              text: prompt || "Analizza questa immagine e compila il planner."
            }
          ]
        }
      ]
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(anthropicPayload)
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: `Claude dice: ${data.error.message}` });
    }

    // Rispediamo il risultato nel formato che l'index del Planner si aspetta
    res.status(200).json(data);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
