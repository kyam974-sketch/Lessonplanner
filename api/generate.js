export default async function handler(req, res) {
  try {
    // Forziamo i parametri corretti direttamente qui nel server
    const body = {
      model: "claude-3-sonnet-20240229", // Modello standard ultra-stabile
      max_tokens: 4000,
      messages: req.body.messages // Prende solo i messaggi (foto + testo) dal tablet
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message || "Errore API Anthropic" });
    }

    // Risposta sicura per il tablet
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Errore Server: " + error.message });
  }
}
