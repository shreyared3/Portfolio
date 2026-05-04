import fetch from "node-fetch";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env") });

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_EMBEDDING_URL = "https://api.mistral.ai/v1/embeddings";

export async function getEmbedding(text) {
  if (!text || !text.trim()) return null;

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

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Mistral embedding error: ${response.status} ${err}`);
    }

    const data = await response.json();
    return data.data?.[0]?.embedding ?? null;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}
