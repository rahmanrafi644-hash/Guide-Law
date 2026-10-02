import Groq from "groq-sdk";
import fs from "fs";

let apiKey = process.env.GROQ_API_KEY;
if (!apiKey && fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  const match = content.match(/GROQ_API_KEY=([^\r\n]+)/);
  if (match) apiKey = match[1].trim();
}

const groq = new Groq({ apiKey });

async function testModel(modelId: string) {
  try {
    console.log(`Testing model: ${modelId}...`);
    const start = Date.now();
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are an expert AI on Bangladeshi commercial law." },
        { role: "user", content: "Under Section 138 of the Negotiable Instruments Act, 1881 in Bangladesh, what is the statutory penalty for dishonour of a cheque?" }
      ],
      model: modelId,
      temperature: 0.2,
      max_tokens: 150
    });
    const duration = Date.now() - start;
    console.log(`[SUCCESS] ${modelId} replied in ${duration}ms:`);
    console.log(chatCompletion.choices[0]?.message?.content);
    return true;
  } catch (err: any) {
    console.log(`[FAIL] ${modelId}:`, err.message || err);
    return false;
  }
}

async function run() {
  for (const m of ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]) {
    const ok = await testModel(m);
    if (ok) break;
  }
}

run();
