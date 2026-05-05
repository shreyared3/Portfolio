import fs from "fs";
import path from "path";
import { getEmbedding } from "../lib/embeddings.js";
import { generateText } from "../lib/generation.js";

// Load full index (documents + vectors)
const indexPath = path.join(process.cwd(), "storage", "indexStore.json");
const indexData = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
const vectorsMap = new Map(indexData.vectors.map((v) => [v.id, v.embedding]));

// ---------------- Helper: cosine similarity ----------------
function cosineSim(vecA, vecB) {
  // Ensure both inputs are arrays
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
    console.error("cosineSim error: one of the vectors is not an array", {
      vecA,
      vecB,
    });
    return 0; // or throw an error if you prefer
  }

  if (vecA.length !== vecB.length) {
    console.error("cosineSim error: vectors have different lengths", {
      vecA,
      vecB,
    });
    return 0; // or throw an error
  }

  const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));

  return dot / (magA * magB + 1e-10);
}

// ---------------- Keyword Bias Rules ----------------
const keywordBias = {
  about: [
    "yourself",
    "who are you",
    "intro",
    "introduction",
    "background",
    "profile",
  ],
  skills: [
    "skills",
    "technologies",
    "tools",
    "expertise",
    "strengths",
    "tech stacks",
  ],
  projects: [
    "projects",
    "portfolio",
    "applications",
    "apps",
    "worked on",
    "built",
  ],
  experience: ["experience", "work history", "career", "roles", "jobs"],
  fun: ["fun", "hobbies", "interests", "free time", "hobby"],
  contact: ["contact", "email", "phone", "linkedin", "github"],
  general: [
    "how did you use",
    "how have you used",
    "tell me about your experience with",
    "your experience with",
    "have you worked with",
    "do you know",
    "what is",
    "how does",
    "explain",
    "what do you know about",
    "can you explain",
    "describe your",
    "how familiar",
  ],
  availability: [
    "available",
    "availability",
    "looking for job",
    "open to work",
    "job search",
    "hiring",
    "open to opportunities",
    "experience gap",
    "career gap",
    "gap in resume",
    "gap in experience",
    "employment gap",
    "work authorization",
    "visa",
    "relocate",
    "relocation",
    "remote",
    "full time",
    "full-time",
    "when can you start",
    "start date",
    "notice period",
    "join immediately",
    "earliest you can",
    "how soon",
  ],
};

function detectKeywordBias(message) {
  const lowerMsg = message.toLowerCase();
  for (const [section, keywords] of Object.entries(keywordBias)) {
    if (keywords.some((k) => lowerMsg.includes(k))) {
      return section;
    }
  }
  return null;
}

// ---------------- Chat Handler ----------------
export async function chatHandler(req, res) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const queryEmbedding = await getEmbedding(message);
    if (!queryEmbedding)
      return res.status(400).json({ error: "Failed to generate embedding" });

    const scoredDocs = indexData.documents
      .map((doc) => {
        const emb = vectorsMap.get(doc.id);
        if (!emb) return null;
        return {
          section: doc.metadata.section,
          id: doc.id,
          score: cosineSim(queryEmbedding, emb),
        };
      })
      .filter(Boolean);

    scoredDocs.sort((a, b) => b.score - a.score);

    // All chat questions are answered by the model using top relevant docs
    {
      const topDocs = scoredDocs.slice(0, 5).map((s) =>
        indexData.documents.find((d) => d.id === s.id)
      ).filter(Boolean);

      const isSalaryQuestion = /\b(salary|compensation|pay|rate|expectation|how much|what do you (expect|want|make)|package)\b/i.test(message);

      const context = topDocs.map((doc) => {
        const meta = doc.metadata || {};
        if (meta.section === "projects" || meta.section === "experience") {
          return `[${meta.section.toUpperCase()}] ${doc.title || meta.name || meta.role}: ${doc.content}`;
        }
        if (meta.section === "skills") {
          return `[SKILLS] ${meta.category}: ${(meta.items || []).join(", ")}`;
        }
        if (meta.section === "availability") {
          const base = `[AVAILABILITY] ${doc.content}`;
          return isSalaryQuestion && meta.salaryExpectation
            ? `${base}\nSalary expectation: ${meta.salaryExpectation}`
            : base;
        }
        return `[${(meta.section || "").toUpperCase()}] ${doc.content}`;
      }).join("\n\n");

      const isComparison = /\b(difference|compare|vs\.?|versus|which is better|pros and cons|when to use|tradeoff|trade-off)\b/i.test(message);

      const prompt = `You are Shreya, a Senior AI/ML Engineer. Answer this question directly and specifically in first person using only the context below.

User question: "${message}"

Context from Shreya's background:
${context}

Formatting rules (follow strictly):
${isComparison
  ? `- This is a comparison question. Respond using a markdown table with clear columns (e.g. | Feature | Option A | Option B |).
- Add a 1–2 sentence summary after the table explaining your personal preference or real usage.`
  : `- Use bullet points (- item) for any list of facts, tools, or achievements.
- Use **bold** to highlight key terms, tools, or metrics.
- Keep it to 4–6 bullet points or a short paragraph if the answer is simple.`
}
- Always answer in first person ("I", "my") from Shreya's perspective
- Be specific — mention exact tools, projects, or numbers from the context
- If the context doesn't mention the topic at all, say so honestly and mention related skills
- Add 1–2 relevant emojis`;

      const aiTextRaw = await generateText(prompt);
      const aiText = aiTextRaw.includes("</think>")
        ? aiTextRaw.split("</think>").pop().trim()
        : aiTextRaw.trim();

      return res.json({ section: "general", structured: { type: "general" }, aiText });
    }
  } catch (err) {
    console.error(`Chat handler error:`, err.message);

    const isOverloaded =
      err.message.includes("429") ||
      err.message.includes("capacity exceeded") ||
      err.message.includes("Too Many Requests") ||
      err.message.includes("service_tier_capacity_exceeded");

    if (isOverloaded) {
      return res.status(503).json({
        error: "service_overloaded",
        message: "The AI service is a little busy right now. Please wait a few seconds and try again. 🙏",
      });
    }

    res.status(500).json({
      error: "Failed to process chat message",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
}
