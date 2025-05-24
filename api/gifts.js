import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ This pulls the key from Vercel's settings
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { age, hobbies } = req.body;

  if (!age || !hobbies) {
    return res.status(400).json({ error: "Missing age or hobbies." });
  }

  const prompt = `
Suggest gift ideas on a budget of ${age} great british pounds and for someone who enjoys ${hobbies}.
Include 3 physical products, 3 experiences, 3 personalised ideas, 3 gift cards and 3 consumables. For each product, add a simple Amazon UK search link like: https://www.amazon.co.uk/s?k=search+term
Write 1–2 sentences per idea.
`;


  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can change this to "gpt-3.5-turbo" if you want cheaper/faster responses
      messages: [{ role: "user", content: prompt }],
    });

    const suggestions = completion.choices[0]?.message?.content;
    res.status(200).json({ suggestions });
  } catch (err) {
    console.error("OpenAI error details:", err); // Log the real error
    res.status(500).json({ error: err.message || "OpenAI request failed." });
  }

}
