export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Manca la chiave ANTHROPIC_API_KEY su Vercel' });
  }

  try {
    const { prompt, imageB64 } = req.body;

    // Chiamata ad Anthropic Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620", // O "claude-3-7-sonnet-20250219" se disponibile
        max_tokens: 1024,
        messages: [{
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
              text: prompt
            }
          ]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(400).json({ error: `Claude dice: ${data.error.message}` });
    }

    // Claude restituisce il testo in un formato leggermente diverso
    if (data.content && data.content[0]) {
      res.status(200).json({ text: data.content[0].text });
    } else {
      throw new Error("Nessuna risposta da Claude.");
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
