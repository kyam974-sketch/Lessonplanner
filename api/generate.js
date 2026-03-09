export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawKey = process.env.ANTHROPIC_API_KEY || "";
  const apiKey = rawKey.replace(/\s+/g, ''); 

  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    // Prendiamo il corpo della richiesta originale
    let body = req.body;

    // Se nel corpo il limite di parole è troppo basso, lo alziamo noi "a forza"
    if (body.max_tokens && body.max_tokens < 2000) {
      body.max_tokens = 2000;
    }

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
    res.status(200).json(data);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
