import Groq from "groq-sdk";
import fs from "fs";

let apiKey = process.env.GROQ_API_KEY;
if (!apiKey && fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  const match = content.match(/GROQ_API_KEY=([^\r\n]+)/);
  if (match) apiKey = match[1].trim();
}

const groq = new Groq({ apiKey });

async function inspectModels() {
  for (const m of ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]) {
    console.log(`\n=== Testing ${m} ===`);
    try {
      const resp = await groq.chat.completions.create({
        messages: [{ role: "user", content: "State Section 138 NI Act penalty in 1 sentence." }],
        model: m,
        max_tokens: 150
      });
      console.log("Full choice[0]:", JSON.stringify(resp.choices[0], null, 2));
    } catch (e: any) {
      console.log("Error:", e.message);
    }
  }
}

inspectModels();
