import Groq from "groq-sdk";
import fs from "fs";

let apiKey = process.env.GROQ_API_KEY;
if (!apiKey && fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  const match = content.match(/GROQ_API_KEY=([^\r\n]+)/);
  if (match) apiKey = match[1].trim();
}

const groq = new Groq({ apiKey });

async function listModels() {
  try {
    const list = await groq.models.list();
    console.log("Available Groq models:");
    list.data.forEach(m => console.log(" -", m.id));
  } catch (e) {
    console.error("List error:", e);
  }
}

listModels();
