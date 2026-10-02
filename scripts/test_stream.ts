import Groq from "groq-sdk";
import fs from "fs";

let apiKey = process.env.GROQ_API_KEY;
if (!apiKey && fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  const match = content.match(/GROQ_API_KEY=([^\r\n]+)/);
  if (match) apiKey = match[1].trim();
}

const groq = new Groq({ apiKey });

async function testStream() {
  console.log("Testing stream with openai/gpt-oss-120b...");
  const stream = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are Guide Law, AI legal assistant." },
      { role: "user", content: "Explain Section 73 of the Contract Act, 1872 regarding breach of contract in 3 bullet points." }
    ],
    model: "openai/gpt-oss-120b",
    temperature: 0.2,
    max_tokens: 500,
    stream: true
  });

  let full = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    full += content;
    process.stdout.write(content);
  }
  console.log("\n--- Stream completed! Total chars:", full.length);
}

testStream();
