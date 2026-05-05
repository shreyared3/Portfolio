import fetch from "node-fetch";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env") });

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_EMBEDDING_URL = "https://api.mistral.ai/v1/embeddings";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function getEmbedding(text, retries = 4) {
  if (!text || !text.trim()) return null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(MISTRAL_EMBEDDING_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistral-embed",
          input: [text],
        }),
      });

      if (response.status === 429) {
        const errText = await response.text();
        const waitMatch = errText.match(/retry[^\d]*(\d+(?:\.\d+)?)/i);
        const waitMs = waitMatch
          ? Math.ceil(parseFloat(waitMatch[1])) * 1000
          : Math.min(2000 * 2 ** attempt, 30000);

        if (attempt < retries) {
          console.warn(`Embedding rate limited, retrying in ${waitMs / 1000}s... (attempt ${attempt + 1}/${retries})`);
          await sleep(waitMs);
          continue;
        }
        throw new Error(`Mistral embedding error: 429 ${errText}`);
      }

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Mistral embedding error: ${response.status} ${err}`);
      }

      const data = await response.json();
      return data.data?.[0]?.embedding ?? null;
    } catch (error) {
      if (attempt < retries && error.message.includes("429")) {
        const waitMs = Math.min(2000 * 2 ** attempt, 30000);
        console.warn(`Embedding error, retrying in ${waitMs / 1000}s...`);
        await sleep(waitMs);
        continue;
      }
      console.error("Error generating embedding:", error.message);
      return null;
    }
  }

  return null;
}
