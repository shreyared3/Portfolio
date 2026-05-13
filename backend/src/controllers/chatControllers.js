import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getEmbedding } from "../lib/embeddings.js";
import { aiService } from "../lib/aiService.js";
import { getCachedResponse, setCachedResponse } from "../lib/cache.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load full index (documents + vectors)
const indexPath = path.join(__dirname, "../../storage", "indexStore.json");
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

function cleanResponse(text) {
  return text
    .replace(/^(here('s| is) my (response|answer)[^:\n]*:?\s*)/im, "")
    .replace(/^(based on (the |this )?context[^:\n]*:?\s*)/im, "")
    .replace(/^(sure[!,.]?\s*)/im, "")
    .replace(/^(certainly[!,.]?\s*)/im, "")
    .replace(/^(of course[!,.]?\s*)/im, "")
    .replace(/\(context fully covered[^)]*\)\s*$/im, "")
    .replace(/\(no additions? needed[^)]*\)\s*$/im, "")
    .replace(/\(note:[^)]*\)\s*$/im, "")
    .replace(/^—\s+/gm, "- ")   // em dash bullet → proper markdown bullet
    .trim();
}

const ABOUT_RE = /\b(who are you|about (your)?self|introduce yourself|tell me about you|your background|your profile|your summary)\b/i;

function sendSSE(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
  if (res.flush) res.flush();
}

function startSSE(res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
}

// ---------------- Chat Handler ----------------
export async function chatHandler(req, res) {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  // Cache hit — stream the cached text as a single chunk
  const cacheKey = message.trim().toLowerCase();
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    startSSE(res);
    sendSSE(res, { type: "chunk", content: cached.aiText });
    sendSSE(res, { type: "done", finalText: cached.aiText });
    return res.end();
  }

  // Embedding (runs before SSE so we can return a plain JSON error on failure)
  const queryEmbedding = await getEmbedding(message);
  if (!queryEmbedding)
    return res.status(400).json({ error: "Failed to generate embedding" });

  // Score and rank docs
  const scoredDocs = indexData.documents
    .map((doc) => {
      const emb = vectorsMap.get(doc.id);
      if (!emb) return null;
      return { section: doc.metadata.section, id: doc.id, score: cosineSim(queryEmbedding, emb) };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  const isAboutMe = ABOUT_RE.test(message);
  const isSalaryQuestion = /\b(salary|compensation|pay|rate|expectation|how much|what do you (expect|want|make)|package)\b/i.test(message);
  const isComparison = /\b(difference|compare|vs\.?|versus|which is better|pros and cons|when to use|tradeoff|trade-off)\b/i.test(message);

  let topDocs;
  if (isAboutMe) {
    // For "about me" — pull only about + most recent experience, skip skills entirely
    const aboutDoc = indexData.documents.find((d) => d.id === "about:main");
    const expDoc = indexData.documents.find((d) => d.id === "experience:0"); // most recent role
    topDocs = [aboutDoc, expDoc].filter(Boolean);
  } else {
    topDocs = scoredDocs.slice(0, 3)
      .map((s) => indexData.documents.find((d) => d.id === s.id))
      .filter(Boolean);
  }

  const context = topDocs.map((doc) => {
    const meta = doc.metadata || {};
    if (meta.section === "experience") {
      return `[EXPERIENCE] ${meta.role} at ${meta.company} (${meta.period}): ${meta.highlights?.join("; ")}`;
    }
    if (meta.section === "projects" ) {
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

  const prompt = isAboutMe
    ? `You are Shreya, a Senior AI/ML Engineer. Introduce yourself naturally in first person using only the context below.

Context:
${context}

Rules (follow strictly):
- Write 3–4 sentences maximum as a flowing paragraph — no bullet points, no lists
- Cover: who you are, your current role and industry, and the business impact you drive
- Do NOT mention specific technologies, tools, frameworks, or programming languages
- Focus on outcomes, industries, and the kind of problems you solve
- Speak naturally and confidently, like a professional introduction
- Do NOT start with phrases like "Here's my response", "Sure!", or any meta-commentary`
    : `You are Shreya, a Senior AI/ML Engineer. Answer this question directly and specifically in first person using only the context below.

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
- Add 1–2 relevant emojis
- Do NOT start with phrases like "Here's my response", "Based on the context", "Sure!", "Certainly!", or any meta-commentary — start directly with the answer
- Do NOT end with phrases like "(Context fully covered)", "(No additions needed)", or any closing meta-note`;

  // Start SSE — all errors from here onward are sent as SSE events
  startSSE(res);

  try {
    let rawText = "";
    await aiService.generateStream(prompt, (chunk) => {
      rawText += chunk;
      sendSSE(res, { type: "chunk", content: chunk });
    });

    const stripped = rawText.includes("</think>")
      ? rawText.split("</think>").pop().trim()
      : rawText.trim();
    const finalText = cleanResponse(stripped);

    setCachedResponse(cacheKey, { aiText: finalText });
    sendSSE(res, { type: "done", finalText });
  } catch (err) {
    console.error("Chat stream error:", err.message);

    const isOverloaded =
      err.message.includes("429") ||
      err.message.includes("capacity exceeded") ||
      err.message.includes("Too Many Requests") ||
      err.message.includes("service_tier_capacity_exceeded");

    sendSSE(res, {
      type: "error",
      code: isOverloaded ? "service_overloaded" : "generation_failed",
      message: isOverloaded
        ? "The AI service is a little busy right now. Please wait a few seconds and try again. 🙏"
        : "Something went wrong generating a response. Please try again.",
    });
  }

  res.end();
}
