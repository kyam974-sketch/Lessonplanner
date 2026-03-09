export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Prendiamo la chiave e puliamola (metodo infallibile visto stasera)
  const rawKey = process.env.ANTHROPIC_API_KEY || "";
  const apiKey = rawKey.replace(/\s+/g, ''); 

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      // Passiamo il body esattamente come arriva, proprio come fa il Follow-up!
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    // Rimandiamo indietro la risposta così come arriva da Anthropic
    res.status(200).json(data);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
