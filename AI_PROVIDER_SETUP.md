# AI Provider Setup

## Quick Setup

1. Copy the environment template:

```bash
cd backend
cp env-template.txt .env
```

2. Add your Mistral API key to `.env` (required).

---

## Active Provider

This portfolio uses **Mistral AI** for both text generation and embeddings.

| Component | Model |
|---|---|
| Text generation | `mistral-small-latest` |
| Embeddings | `mistral-embed` |

Get a free API key at [console.mistral.ai](https://console.mistral.ai/).

---

## `.env` Configuration

**Mistral (Active — required)**

```env
AI_PROVIDER=mistral
MISTRAL_API_KEY=your_key_here
MISTRAL_MODEL=mistral-small-latest
```

**Gemini**

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
```

**OpenAI**

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-3.5-turbo
```

**Anthropic**

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=claude-3-haiku-20240307
```

**Hugging Face**

```env
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=your_key_here
HUGGINGFACE_MODEL=microsoft/DialoGPT-medium
```

**Ollama (Local, no API key needed)**

```env
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
```

**Optional backend settings:**

```env
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com

# Express Rate Limiting (all /api/* routes)
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100          # Max requests per window

# IP-Based Rate Limiting (chat/sections endpoints)
MAX_REQUESTS_PER_IP=30               # Max requests per IP per day
IP_RATE_LIMIT_WINDOW_MS=86400000     # 24 hours
MIN_REQUEST_INTERVAL_MS=2000         # Min 2 seconds between requests

# Admin IP Whitelist (bypasses rate limits)
ADMIN_IPS=                           # Example: 192.168.1.100,10.0.0.1

# Caching
CACHE_DURATION_MS=172800000          # 48 hours
EMBEDDING_REQUEST_TIMEOUT_MS=30000   # 30 seconds
```

---

## Other Supported Providers

To switch providers, uncomment the relevant block in `backend/src/config/ai.config.js`, update `.env`, and restart the backend.

---

**Gemini (Free tier, good for production)**

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
```

---

**OpenAI**

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-3.5-turbo
```

---

**Anthropic**

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=claude-3-haiku-20240307
```

---

**Ollama (Local, private)**

```env
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
```

---

**Hugging Face**

```env
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=your_key_here
HUGGINGFACE_MODEL=microsoft/DialoGPT-medium
```

---

After switching, restart the backend:

```bash
npm run dev
```

---

## Testing Your Setup

```bash
cd backend
npm run dev
curl http://localhost:3000/api/provider-info
```

Expected output:

```json
{
  "success": true,
  "provider": "mistral",
  "model": "mistral-small-latest",
  "status": "available"
}
```

---

## Fallback Configuration

Edit `backend/src/config/ai.config.js` to add fallback providers:

```javascript
fallbacks: ["gemini", "openai"]
```

---

## Rate Limiting & Cost Protection

- 48-hour caching reduces duplicate API calls
- IP-based rate limiting (30 requests/day per IP by default)
- Monitor usage: `curl http://localhost:3000/api/stats/usage`

---

## Production (Fly.io)

Set your key as a secret — never commit it:

```bash
fly secrets set MISTRAL_API_KEY=your_key_here
```

---

## Getting Help

- API key issues → [Mistral docs](https://docs.mistral.ai/)
- Technical issues → `backend/logs`

---

**Last Updated:** May 2026
