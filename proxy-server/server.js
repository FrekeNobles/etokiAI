import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.post("/summarize", async (req, res) => {
  try {
    const { content, mode } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({
        error: "Missing content"
      });
    }

    const prompt =
      mode === "3-bullets"
        ? `
Summarize this webpage in exactly 3 concise bullet points.

Also return:
- 3 key insights
- estimated reading time in minutes

Return ONLY valid JSON in this exact format:
{
  "summary": ["...", "...", "..."],
  "insights": ["...", "...", "..."],
  "readingTime": "..."
}
`
        : `
Summarize this webpage clearly.

Also return:
- 4 summary bullet points
- 3 key insights
- estimated reading time in minutes

Return ONLY valid JSON in this exact format:
{
  "summary": ["...", "...", "...", "..."],
  "insights": ["...", "...", "..."],
  "readingTime": "..."
}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: "You are a precise webpage summarizer."
          },
          {
            role: "user",
            content: `${prompt}\n\n${content.slice(0, 12000)}`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(500).json({
        error: "AI request failed"
      });
    }

    const raw = data.choices?.[0]?.message?.content || "{}";

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(500).json({
        error: "Failed to parse AI response"
      });
    }

    res.json(parsed);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error"
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Proxy running on port ${process.env.PORT || 3000}`);
});