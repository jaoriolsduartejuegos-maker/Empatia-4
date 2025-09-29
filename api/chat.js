export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { prompt } = req.body;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Gemini error:", data.error);
      return res.status(400).json({ error: data.error.message });
    }

    // Gemini responde en data.candidates[0].content.parts[0].text
    return res.status(200).json(data);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Error interno en el servidor" });
  }
}
