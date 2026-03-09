export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawKey = process.env.ANTHROPIC_API_KEY || "";
  const apiKey = rawKey.replace(/\s+/g, ''); 

  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    let body = req.body;

    // FORZIAMO IL MASSIMO: diamo a Claude spazio per 4000 tokens
    // Questo risolve l'errore "Output too large"
    body.max_tokens = 4000;

    // Se il modello inviato dall'index dà problemi, lo sovrascriviamo con quello sicuro
    body.model = "claude-3-5-sonnet-20240620"; 

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data.error) {
      // Se Sonnet non è disponibile, facciamo l'ultimo tentativo automatico con Haiku
      if (data.error.message.includes("not found")) {
         body.model = "claude-3-haiku-20240307";
         const retry = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(body)
         });
         const retryData = await retry.json();
         return res.status(200).json(retryData);
      }
      return res.status(400).json({ error: `Claude dice: ${data.error.message}` });
    }

    res.status(200).json(data);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
