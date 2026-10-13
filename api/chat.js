export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Gunakan metode POST."
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "API key belum diatur di Vercel."
    });
  }

  try {
    const { message } = req.body || {};

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 4000
    ) {
      return res.status(400).json({
        error: "Pertanyaan harus diisi dan maksimal 4000 karakter."
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          instructions:
            "Kamu adalah asisten belajar Kuliahku. Jawab dalam bahasa Indonesia yang ramah, jelas, dan mudah dipahami mahasiswa. Bantu memahami materi dan merencanakan belajar. Jangan mengarang informasi jika tidak yakin.",
          input: message.trim(),
          max_output_tokens: 700
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("AI provider error:", data);
      return res.status(502).json({
        error: "Layanan AI belum dapat menjawab. Coba lagi nanti."
      });
    }

    const answer = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    return res.status(200).json({
      answer: answer || "Maaf, belum ada jawaban. Coba tanyakan lagi."
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({
      error: "Terjadi kesalahan. Silakan coba lagi."
    });
  }
}
