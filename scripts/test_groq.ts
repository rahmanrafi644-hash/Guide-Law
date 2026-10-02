import Groq from "groq-sdk";
import fs from "fs";

// Load .env.local manually for script
let apiKey = process.env.GROQ_API_KEY;
if (!apiKey && fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  const match = content.match(/GROQ_API_KEY=([^\r\n]+)/);
  if (match) apiKey = match[1].trim();
}

console.log("Using API key starting with:", apiKey ? apiKey.slice(0, 10) + "..." : "NONE");

const groq = new Groq({ apiKey });

async function testGroq() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a legal scholar on Bangladeshi commercial law." },
        { role: "user", content: "State the penalty for dishonour of a cheque under Section 138 of the Negotiable Instruments Act, 1881 in Bangladesh in one concise sentence." }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 150
    });
    console.log("Groq API response:");
    console.log(chatCompletion.choices[0]?.message?.content);
  } catch (err) {
    console.error("Groq test error:", err);
  }
}

testGroq();
