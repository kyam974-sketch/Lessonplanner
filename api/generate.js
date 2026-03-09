export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    // Gestione ultra-sicura della risposta per evitare l'errore "undefined"
    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    // Se la risposta è nel formato standard Messages API
    if (data.content && data.content[0]) {
      return res.status(200).json(data);
    } 
    
    // Se Claude risponde in un formato alternativo
    return res.status(200).json({
      content: [{ type: 'text', text: data.text || JSON.stringify(data) }]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
