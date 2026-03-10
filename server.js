/**
 * SaintSal Labs — AI API Gateway v2
 * Proxies: Anthropic, xAI, OpenAI, Gemini
 * NEW: /api/builder endpoint for SAL Builder
 * 
 * Deploy to Render: https://render.com
 * US Patent #10,290,222 · HACP Protocol
 */

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const app  = express();
const PORT = process.env.PORT || 3000;

const ANTHROPIC_KEY        = process.env.ANTHROPIC_API_KEY;
const OPENAI_KEY           = process.env.OPENAI_API_KEY;
const GEMINI_KEY           = process.env.GEMINI_API_KEY;
const GEMINI_KEY_FALLBACK  = process.env.GEMINI_API_KEY_FALLBACK;
const XAI_KEY              = process.env.XAI_API_KEY;
const API_SECRET           = process.env.API_SECRET || 'sal-live-2026';

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' }));

// ── Auth ─────────────────────────────────────────────
function auth(req, res, next) {
  if (req.headers['x-sal-key'] !== API_SECRET)
    return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ── Health ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:  'ok',
    service: 'SaintSal Labs API Gateway v2',
    patent:  'US #10,290,222',
    version: '2.0.0',
    providers: {
      anthropic: !!ANTHROPIC_KEY,
      openai:    !!OPENAI_KEY,
      gemini:    !!GEMINI_KEY,
      xai:       !!XAI_KEY,
    },
  });
});

// ── Anthropic Claude SSE ──────────────────────────────
app.post('/api/chat/anthropic', auth, async (req, res) => {
  const { model, system, messages, max_tokens } = req.body;
  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      model || 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 4096,
        system:     system || '',
        messages,
        stream: true,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      return res.status(upstream.status).json({ error: err });
    }

    res.setHeader('Content-Type',  'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection',    'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const reader  = upstream.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (err) {
    console.error('Anthropic error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── SAL Builder (Anthropic with builder system prompt) ─
const BUILDER_SYSTEM = `You are SAL Builder — the world's best full-stack AI engineer for SaintSal™ Labs (saintsallabs.com), backed by US Patent #10,290,222 HACP Protocol.

WHEN BUILDING CODE:
1. Start with a 2-3 sentence architecture overview
2. Generate EVERY file — complete, no placeholders, no truncation
3. Label EVERY code block with file path: \`\`\`tsx src/app/page.tsx
4. Include: package.json, .env.example, README.md, vercel.json
5. Code must be TypeScript-first, production-ready, immediately deployable

TECH DEFAULTS (unless instructed otherwise):
- Framework: Next.js 14 App Router
- Styling: Tailwind CSS + shadcn/ui
- Database: Supabase or Upstash
- Auth: Clerk
- Payments: Stripe
- Deploy: Vercel
- Colors: #0C0C0F bg · #F59E0B amber · #E8E6E1 text (SaintSal design system)

AFTER CODE — ALWAYS INCLUDE:
- Environment variables needed (every key)
- Deploy steps (3-5 steps max)

FOR SOCIAL: Return JSON only — {"twitter":"...","linkedin":"...","instagram":"...","tiktok":"...","facebook":"..."}
FOR IMAGES: Return DALL-E 3, Midjourney, Stable Diffusion, and Director Notes
FOR VIDEO: Return Hook → Script → Shot List → Runway Prompts → Captions → Music → CTA

NEVER use placeholder comments. NEVER truncate. ALWAYS complete.`;

app.post('/api/builder', auth, async (req, res) => {
  const { prompt, files, framework, tier, system: customSystem } = req.body;

  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  const fileContext = files?.length
    ? '\n\nEXISTING PROJECT FILES:\n' + files.map(f => `\`\`\`${f.lang} ${f.name}\n${f.content}\n\`\`\``).join('\n\n')
    : '';

  const frameworkHint = framework ? `\nTarget framework: ${framework}.` : '';
  const system = customSystem || (BUILDER_SYSTEM + frameworkHint);

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      tier === 'max' ? 'claude-opus-4-20250514' : 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system,
        messages:   [{ role: 'user', content: prompt + fileContext }],
        stream: true,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      return res.status(upstream.status).json({ error: err });
    }

    res.setHeader('Content-Type',  'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection',    'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-SAL-Tier', tier || 'pro');

    const reader  = upstream.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (err) {
    console.error('Builder error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── xAI Grok SSE ──────────────────────────────────────
app.post('/api/chat/xai', auth, async (req, res) => {
  const { model, messages, max_tokens } = req.body;
  try {
    const upstream = await fetch('https://api.x.ai/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${XAI_KEY}`,
      },
      body: JSON.stringify({
        model:      model || 'grok-3',
        messages,
        max_tokens: max_tokens || 4096,
        stream: true,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      return res.status(upstream.status).json({ error: err });
    }

    res.setHeader('Content-Type',  'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection',    'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const reader  = upstream.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── OpenAI (non-streaming, for social JSON) ───────────
app.post('/api/chat/openai', auth, async (req, res) => {
  const { model, messages, max_tokens } = req.body;
  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model:      model || 'gpt-4o-mini',
        messages,
        max_tokens: max_tokens || 2048,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      return res.status(upstream.status).json({ error: err });
    }
    const data = await upstream.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Gemini Search with grounding ──────────────────────
app.post('/api/search/gemini', auth, async (req, res) => {
  const { query } = req.body;
  const keys = [GEMINI_KEY, GEMINI_KEY_FALLBACK].filter(Boolean);

  for (const key of keys) {
    try {
      const upstream = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'X-goog-api-key': key },
          body:    JSON.stringify({
            contents: [{ parts: [{ text: query }] }],
            tools:    [{ google_search: {} }],
          }),
        }
      );

      if (upstream.ok) {
        const data      = await upstream.json();
        const candidate = data.candidates?.[0];
        const text      = candidate?.content?.parts?.[0]?.text || 'No results found.';
        const chunks    = candidate?.groundingMetadata?.groundingChunks || [];
        const sources   = chunks
          .filter(c => c.web)
          .map(c => ({ title: c.web.title || 'Source', url: c.web.uri || '', snippet: '' }));

        return res.json({ answer: text, sources });
      }
    } catch {}
  }

  // Fallback to OpenAI
  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
      body:    JSON.stringify({
        model:    'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Answer comprehensively. End with:\nSOURCES:\n- [Title](URL)' },
          { role: 'user', content: query },
        ],
        max_tokens: 2048,
      }),
    });
    const data     = await upstream.json();
    const fullText = data.choices?.[0]?.message?.content || '';
    const answer   = fullText.split('SOURCES:')[0].trim();
    const srcSec   = fullText.split('SOURCES:')[1] || '';
    const sources  = [];
    const re       = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
    let m;
    while ((m = re.exec(srcSec)) !== null) sources.push({ title: m[1], url: m[2], snippet: '' });
    res.json({ answer, sources });
  } catch (err) {
    res.status(500).json({ error: 'All search providers failed' });
  }
});

app.listen(PORT, () => {
  console.log(`SaintSal Labs API Gateway v2 on port ${PORT}`);
  console.log(`Providers: Anthropic=${!!ANTHROPIC_KEY} OpenAI=${!!OPENAI_KEY} Gemini=${!!GEMINI_KEY} xAI=${!!XAI_KEY}`);
});
