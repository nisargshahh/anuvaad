if (process.env.NODE_ENV !== "production") {
  (async () => {
    const dotenv = await import("dotenv");
    dotenv.config();
  })();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Not POST" });
  }

  const { text, target } = req.body;

  if (!text || !target) {
    return res.status(400).json({ error: "Missing Text or Language." });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        target,
        format: "text",
      }),
    });

    if (!response.ok) {
      const errorT = await response.text();
      return res.status(response.status).json({ error: errorT });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in API Call");
    res.status(500).json({ error: "Internal Server Error." });
  }
}
