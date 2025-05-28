import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { age, hobbies } = req.body;

  if (!age || !hobbies) {
    return res.status(400).json({ error: "Missing age or hobbies." });
  }

  const prompt = `
Suggest creative and thoughtful gift ideas for someone aged ${age}, who enjoys ${hobbies}.
Include:
- 3 physical products
- 3 experiences
- 3 personalized ideas
- 3 gift cards
- 3 consumables

For each idea:
- Write 1–2 sentences of description
- Estimate a price in GBP
- Add a simple Amazon UK search link like: https://www.amazon.co.uk/s?k=search+term
Format the ideas clearly in bullet points under each category.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const suggestions = completion.choices[0]?.message?.content;
    res.status(200).json({ suggestions });
  } catch (err) {
    console.error("OpenAI error details:", err);
    res.status(500).json({ error: err.message || "OpenAI request failed." });
  }
}
