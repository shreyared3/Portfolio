# AI Portfolio — Shreya Reddy

An AI-powered personal portfolio with a conversational chat interface. Ask it anything about Shreya's experience, projects, skills, or availability — and it answers in first person using RAG (Retrieval-Augmented Generation) over a structured knowledge base.

Built with **React + TypeScript (Vite)** on the frontend and **Node.js + Express** on the backend, powered by **Mistral AI** for embeddings and text generation.

---

## Features

- Conversational chat UI with quick-action prompts
- RAG pipeline — semantic search over a personal knowledge base
- Sections: About, Experience, Projects, Skills, Education, Contact, Availability
- Fluid animated background, Framer Motion transitions, dark/light theme
- Multiple AI provider support: Mistral, Gemini, OpenAI, Anthropic, Ollama
- Rate limiting, caching, and production-ready Docker setup

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express |
| AI / Embeddings | Mistral AI (`mistral-embed`, `mistral-small-latest`) |
| Deployment | Docker, Fly.io |

---

## Local Development

### Prerequisites

- Node.js 18+
- A [Mistral AI](https://console.mistral.ai/) API key (free tier available)

### Setup

1. Clone the repo:

```bash
git clone https://github.com/shreyared3/Portfolio.git
cd Portfolio
```

2. Install dependencies:

```bash
cd frontend && npm install
cd ../backend && npm install
```

3. Create the backend environment file:

```bash
cd backend
cp env-template.txt .env
# Add your MISTRAL_API_KEY to .env
```

4. Ingest the knowledge base:

```bash
cd backend && npm run ingest
```

5. Start both backends:

```bash
# Frontend (http://localhost:8000)
cd frontend && npm run dev

# Backend (http://localhost:3000) — separate terminal
cd backend && npm run dev
```

---

## Deployment (Fly.io)

This repo includes a `Dockerfile` and `fly.toml` ready for Fly.io.

```bash
# Install CLI
brew install flyctl

# Login / signup
fly auth login

# Deploy
fly deploy

# Set your API key as a secret
fly secrets set MISTRAL_API_KEY=your_key_here
```

---

## Customizing for Your Own Portfolio

1. Edit `backend/data/knowledge.json` with your own background
2. Run `npm run ingest` to rebuild the vector index
3. Update `backend/src/controllers/sectionControllers.js` prompts if needed
4. Swap out photos in `frontend/public/`

---

## License

MIT License — see [LICENSE](LICENSE).

---

## Contact

**Shreya Reddy** — Senior AI/ML Engineer

- Email: shreyared3@gmail.com
- LinkedIn: [linkedin.com/in/shreyar3](https://www.linkedin.com/in/shreyar3)
- GitHub: [github.com/shreyared3](https://github.com/shreyared3)
