/**
 * SaintSal Labs — AI API Gateway v2
 * Proxies: Anthropic, xAI, OpenAI, Gemini
 * NEW: /api/builder endpoint for SAL Builder
 * 
 * Deploy to Render: https://render.com
 * US Patent #10,290,222 · HACP Protocol
 */

const crypto  = require('crypto');
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

// ── Twitter env ──────────────────────────────────────
const TWITTER_CONSUMER_KEY    = process.env.TWITTER_CONSUMER_KEY    || '';
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET || '';
const TWITTER_ACCESS_TOKEN    = process.env.TWITTER_ACCESS_TOKEN    || '';
const TWITTER_SECRET_TOKEN    = process.env.TWITTER_SECRET_TOKEN    || '';
const TWITTER_BEARER_TOKEN    = process.env.TWITTER_API_TOKEN       || '';

// ── LinkedIn OAuth env ───────────────────────────────
const LINKEDIN_CLIENT_ID     = process.env.LINKEDIN_CLIENT_ID     || '';
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || '';
const LINKEDIN_REDIRECT_URI  = process.env.LINKEDIN_REDIRECT_URI  || 'saintsallabs://social/linkedin/callback';

// ── LinkedIn OAuth — Authorization URL ───────────────
app.get('/api/social/linkedin/auth', (req, res) => {
  if (!LINKEDIN_CLIENT_ID) {
    return res.status(503).json({ error: 'LinkedIn OAuth not configured' });
  }

  const state = Buffer.from(crypto.randomUUID()).toString('base64url');
  const scopes = 'openid profile email w_member_social';
  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     LINKEDIN_CLIENT_ID,
    redirect_uri:  LINKEDIN_REDIRECT_URI,
    state,
    scope:         scopes,
  });

  res.json({
    authorization_url: `https://www.linkedin.com/oauth/v2/authorization?${params}`,
    state,
  });
});

// ── LinkedIn OAuth — Token Exchange ──────────────────
app.post('/api/social/linkedin/callback', async (req, res) => {
  const { code, state } = req.body;

  if (!code) return res.status(400).json({ error: 'code is required' });
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
    return res.status(503).json({ error: 'LinkedIn OAuth not configured' });
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        redirect_uri:  LINKEDIN_REDIRECT_URI,
        client_id:     LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return res.status(tokenRes.status).json({ error: `LinkedIn token error: ${err}` });
    }

    const tokenData = await tokenRes.json();

    // Fetch user profile with the access token
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    let name = null, email = null, profile_id = null;
    if (profileRes.ok) {
      const profile = await profileRes.json();
      name       = profile.name || null;
      email      = profile.email || null;
      profile_id = profile.sub || null;
    }

    res.json({
      access_token: tokenData.access_token,
      expires_in:   tokenData.expires_in,
      name,
      email,
      profile_id,
    });
  } catch (err) {
    console.error('LinkedIn callback error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── LinkedIn Post ────────────────────────────────────
app.post('/api/social/linkedin/post', auth, async (req, res) => {
  const { access_token, content, visibility } = req.body;

  if (!access_token) return res.status(400).json({ error: 'access_token is required' });
  if (!content)      return res.status(400).json({ error: 'content is required' });

  try {
    // Get the user's profile ID for the author URN
    const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!meRes.ok) {
      return res.status(401).json({ error: 'Invalid or expired LinkedIn access token' });
    }

    const me = await meRes.json();
    const authorUrn = `urn:li:person:${me.sub}`;

    // Create post via Community Management API
    const postRes = await fetch('https://api.linkedin.com/rest/posts', {
      method:  'POST',
      headers: {
        'Content-Type':       'application/json',
        Authorization:        `Bearer ${access_token}`,
        'LinkedIn-Version':   '202401',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author:          authorUrn,
        commentary:      content,
        visibility:      (visibility || 'PUBLIC'),
        distribution:    { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
        lifecycleState:  'PUBLISHED',
        isReshareDisabledByAuthor: false,
      }),
    });

    if (!postRes.ok) {
      const err = await postRes.text();
      return res.status(postRes.status).json({ error: `LinkedIn post error: ${err}` });
    }

    // Post ID is in the x-restli-id header
    const postId = postRes.headers.get('x-restli-id') || null;

    res.json({ success: true, post_id: postId });
  } catch (err) {
    console.error('LinkedIn post error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Social Content Generation ────────────────────────
app.post('/api/social/generate', auth, async (req, res) => {
  const { prompt, platforms, tone, includeHashtags } = req.body;

  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  const targetPlatforms = platforms?.length ? platforms : ['twitter', 'linkedin', 'instagram', 'tiktok', 'facebook'];
  const hashtagNote     = includeHashtags !== false ? 'Include 3-5 relevant hashtags per platform.' : 'Do NOT include hashtags.';

  const systemPrompt = `You are a world-class social media content strategist for SaintSal™ Labs.
Generate platform-native content for each requested platform. Each post should feel native to that platform's culture and format.

Guidelines:
- Twitter: 280 chars max, punchy, conversational
- LinkedIn: Professional, thought-leadership style, 1-3 paragraphs
- Instagram: Visual-first caption, emoji-friendly, story-driven
- TikTok: Hook-first, trending style, script-like
- Facebook: Community-focused, shareable, slightly longer form
${tone ? `Tone: ${tone}` : 'Tone: professional yet approachable'}
${hashtagNote}

RESPOND WITH ONLY valid JSON — no markdown, no code fences:
{"twitter":"...","linkedin":"...","instagram":"...","tiktok":"...","facebook":"..."}
Only include the platforms requested: ${targetPlatforms.join(', ')}`;

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model:    'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: prompt },
        ],
        max_tokens:  2048,
        temperature: 0.8,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      return res.status(upstream.status).json({ error: `OpenAI error: ${err}` });
    }

    const data    = await upstream.json();
    const rawText = data.choices?.[0]?.message?.content || '';

    // Parse JSON — strip any accidental markdown wrapping
    const cleaned = rawText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();

    try {
      const content = JSON.parse(cleaned);
      res.json(content);
    } catch {
      // If JSON parse fails, return the raw text keyed to the first platform
      res.json({ [targetPlatforms[0]]: rawText, _raw: true });
    }
  } catch (err) {
    console.error('Social generate error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Social Account Status ────────────────────────────
// ── Twitter Post ─────────────────────────────────────
function generateOAuth1Header(method, url, params, consumerKey, consumerSecret, accessToken, tokenSecret) {
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomUUID().replace(/-/g, ''),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
  };
  const allParams = { ...oauthParams, ...params };
  const sortedKeys = Object.keys(allParams).sort();
  const paramString = sortedKeys.map(k =>
    `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`
  ).join('&');
  const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
  oauthParams.oauth_signature = signature;
  const header = 'OAuth ' + Object.keys(oauthParams).sort().map(k =>
    `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`
  ).join(', ');
  return header;
}

app.post('/api/social/twitter/post', auth, async (req, res) => {
  const { content, access_token, access_secret } = req.body;
  if (!content) return res.status(400).json({ error: 'content is required' });

  // Use per-user tokens if provided, else fall back to env vars
  const userAccessToken  = access_token  || TWITTER_ACCESS_TOKEN;
  const userAccessSecret = access_secret || TWITTER_SECRET_TOKEN;

  if (!TWITTER_CONSUMER_KEY || !TWITTER_CONSUMER_SECRET) {
    return res.status(503).json({ error: 'Twitter consumer keys not configured. Add TWITTER_CONSUMER_KEY and TWITTER_CONSUMER_SECRET.' });
  }
  if (!userAccessToken || !userAccessSecret) {
    return res.status(401).json({ error: 'Twitter access tokens not provided.' });
  }

  try {
    const tweetUrl = 'https://api.twitter.com/2/tweets';
    const authHeader = generateOAuth1Header(
      'POST', tweetUrl, {},
      TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET,
      userAccessToken, userAccessSecret
    );
    const tweetRes = await fetch(tweetUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ text: content.slice(0, 280) }),
    });
    const tweetData = await tweetRes.json();
    if (!tweetRes.ok) {
      return res.status(tweetRes.status).json({ error: `Twitter error: ${JSON.stringify(tweetData)}` });
    }
    res.json({ success: true, tweet_id: tweetData.data?.id, url: `https://x.com/i/status/${tweetData.data?.id}` });
  } catch (err) {
    console.error('Twitter post error:', err.message);
    res.status(500).json({ error: 'Twitter post failed' });
  }
});

// ── Twitter Verify ───────────────────────────────────
app.get('/api/social/twitter/verify', auth, async (req, res) => {
  if (!TWITTER_CONSUMER_KEY || !TWITTER_CONSUMER_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_SECRET_TOKEN) {
    return res.json({ connected: false, reason: 'Missing consumer keys or access tokens' });
  }
  try {
    const verifyUrl = 'https://api.twitter.com/2/users/me';
    const authHeader = generateOAuth1Header(
      'GET', verifyUrl, {},
      TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET,
      TWITTER_ACCESS_TOKEN, TWITTER_SECRET_TOKEN
    );
    const verifyRes = await fetch(verifyUrl, {
      headers: { 'Authorization': authHeader },
    });
    const data = await verifyRes.json();
    if (verifyRes.ok && data.data) {
      res.json({ connected: true, username: data.data.username, name: data.data.name, id: data.data.id });
    } else {
      res.json({ connected: false, reason: data.detail || 'Verification failed' });
    }
  } catch (err) {
    res.json({ connected: false, reason: err.message });
  }
});

app.get('/api/social/status', auth, (req, res) => {
  res.json({
    linkedin: {
      configured:    !!LINKEDIN_CLIENT_ID && !!LINKEDIN_CLIENT_SECRET,
      client_id_set: !!LINKEDIN_CLIENT_ID,
    },
    twitter: {
      configured: !!TWITTER_CONSUMER_KEY && !!TWITTER_ACCESS_TOKEN,
      has_consumer_keys: !!TWITTER_CONSUMER_KEY && !!TWITTER_CONSUMER_SECRET,
      has_access_tokens: !!TWITTER_ACCESS_TOKEN && !!TWITTER_SECRET_TOKEN,
    },
    instagram: { configured: false },
    tiktok:    { configured: false },
    facebook:  { configured: false },
  });
});

// ── SAL Supreme — Make.com Orchestration Brain ───────
const GHL_LOCATION_ID    = process.env.GHL_LOCATION_ID          || 'oRA8vL3OSiCPjpwmEC0V';
const GHL_PRIVATE_TOKEN  = process.env.GHL_PRIVATE_ACCESS_TOKEN || '';
const GHL_LOCATION_KEY   = process.env.GHL_LOCATION_KEY         || '';

const SAL_SUPREME_SYSTEM = `You are SAL "SaintSal™" — the unified AI orchestration brain for SaintSal™ Labs,
a Synthetic AGI Orchestration Platform backed by US Patent #10,290,222 (HACP Protocol).

You operate in 4 MODES — auto-selected based on context:
  1. PLATFORM_AI    — SaintSal Labs user questions, feature help, product guidance
  2. SALES_BOT      — GHL lead qualification, appointment booking, pricing objections
  3. BUILDER_ENGINE — Technical builds, code, integrations, deployment help
  4. OPS_MONITOR    — Daily ops digest, metrics, churn alerts, team reporting

CONTEXT INJECTION (Make.com will provide):
  - Contact: name, email, phone, tags, pipeline stage, tier, channel
  - Message: the inbound text/voice/chat content
  - History: prior conversation turns

YOUR JOB:
  1. Detect the correct mode
  2. Craft the perfect response for that contact
  3. Decide the next Make.com action

OUTPUT FORMAT — ALWAYS return EXACTLY this JSON (no markdown, no explanation):
{
  "response_text": "The message to send back to the contact",
  "next_action": "one of: respond | book_call | qualify_lead | escalate | send_welcome | trigger_onboarding | payment_failed_retry | no_action",
  "tag_add": "tag_to_add or null",
  "tag_remove": "tag_to_remove or null",
  "pipeline_stage": "stage_name or null",
  "internal_alert": "message to AJK/team or null",
  "mode_used": "platform_ai | sales_bot | builder_engine | ops_monitor",
  "confidence": 0.95
}

TONE: Warm, direct, faith-forward. Never robotic. Never corporate filler.
BRAND: SaintSal™ Labs — Responsible Intelligence™ | 175+ countries | 53 AI models

BEHAVIORAL RULES:
- Truth over comfort. Wrong answers delivered confidently cause damage.
- Lead with the answer. Never restate the question.
- Make every response immediately actionable.
- If a lead mentions budget/urgency → SALES_BOT mode, push to book call.
- If a user has payment issues → escalate + alert AJK.
- If onboarding question → PLATFORM_AI mode, be their expert guide.`;

app.post('/api/sal/respond', auth, async (req, res) => {
  const { contact = {}, scenario = {}, message, history = [] } = req.body;

  if (!message) return res.status(400).json({ error: 'message is required' });

  const contextBlock = [
    contact.name        && `Contact: ${contact.name}`,
    contact.email       && `Email: ${contact.email}`,
    contact.phone       && `Phone: ${contact.phone}`,
    contact.tier        && `Tier: ${contact.tier}`,
    contact.tags?.length && `Tags: ${contact.tags.join(', ')}`,
    contact.pipeline_stage && `Pipeline Stage: ${contact.pipeline_stage}`,
    scenario.channel    && `Channel: ${scenario.channel}`,
    scenario.type       && `Scenario: ${scenario.type}`,
  ].filter(Boolean).join('\n');

  const userContent = contextBlock
    ? `[CONTACT CONTEXT]\n${contextBlock}\n\n[MESSAGE]\n${message}`
    : message;

  const messages = [
    ...history.map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
    { role: 'user', content: userContent },
  ];

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 2048,
        system:     SAL_SUPREME_SYSTEM,
        messages,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      return res.status(upstream.status).json({ error: err });
    }

    const data    = await upstream.json();
    const rawText = data.content?.[0]?.text || '';

    // Parse the JSON block SAL returns
    let parsed = {};
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      try { parsed = JSON.parse(jsonMatch[1]); } catch (_) { /* use defaults */ }
    }

    res.json({
      response_text:  parsed.response_text  || rawText,
      next_action:    parsed.next_action    || 'respond',
      tag_add:        parsed.tag_add        || null,
      tag_remove:     parsed.tag_remove     || null,
      pipeline_stage: parsed.pipeline_stage || null,
      internal_alert: parsed.internal_alert || null,
      mode_used:      parsed.mode_used      || 'platform_ai',
      confidence:     parsed.confidence     || 0.9,
    });
  } catch (err) {
    console.error('SAL respond error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Builder env ───────────────────────────────────────
const SUPABASE_URL      = process.env.SUPABASE_URL      || 'https://euxrlpuegeiggedqbkiv.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
const ELEVENLABS_KEY    = process.env.ELEVENLABS_API_KEY || '';
const REPLICATE_KEY     = process.env.REPLICATE_API_TOKEN || '';

// Tier → model routing
const TIER_MODEL = {
  free:       { provider: 'gemini',    model: 'gemini-2.0-flash' },
  starter:    { provider: 'gemini',    model: 'gemini-2.0-flash' },
  pro:        { provider: 'anthropic', model: 'claude-sonnet-4-6' },
  teams:      { provider: 'anthropic', model: 'claude-sonnet-4-6' },
  enterprise: { provider: 'anthropic', model: 'claude-opus-4-6' },
};

const BUILDER_SYSTEM_V3 = `You are SAL Builder — elite AI engineer for SaintSal™ Labs (US Patent #10,290,222 HACP Protocol).
Generate complete, production-ready code. No placeholders. No truncation.
Label every file: \`\`\`tsx path/to/file.tsx
Include: package.json, README, .env.example, deployment config.
Stack defaults: Next.js 14 App Router, Tailwind CSS, Supabase, Stripe, Vercel.
Design system: #0C0C0F bg · #D4AF37 gold · Public Sans font.`;

// ── POST /api/builder/generate — Tier-routed SSE ─────
app.post('/api/builder/generate', auth, async (req, res) => {
  const { prompt, tier = 'free', type = 'code', system: customSystem, files } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  const { provider, model } = TIER_MODEL[tier] || TIER_MODEL.free;
  const system = customSystem || BUILDER_SYSTEM_V3;

  const fileContext = files?.length
    ? '\n\nEXISTING FILES:\n' + files.map(f => `\`\`\`${f.lang || 'tsx'} ${f.name}\n${f.content}\n\`\`\``).join('\n\n')
    : '';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-SAL-Model', model);
  res.setHeader('X-SAL-Tier', tier);

  try {
    if (provider === 'gemini') {
      // Gemini for free/starter — not streamed, wrap as SSE
      const gemRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GEMINI_KEY },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: system }] },
            contents: [{ parts: [{ text: prompt + fileContext }] }],
            generationConfig: { maxOutputTokens: 8192, temperature: 0.7 },
          }),
        }
      );
      if (!gemRes.ok) {
        const err = await gemRes.text();
        res.write(`data: ${JSON.stringify({ error: err })}\n\n`);
        return res.end();
      }
      const gemData = await gemRes.json();
      const text = gemData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      // Emit as Anthropic-style SSE chunks
      const chunkSize = 100;
      for (let i = 0; i < text.length; i += chunkSize) {
        res.write(`data: ${JSON.stringify({ type: 'content_block_delta', delta: { text: text.slice(i, i + chunkSize) } })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    // Anthropic for pro/teams/enterprise
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: tier === 'enterprise' ? 16000 : 8192,
        system,
        messages: [{ role: 'user', content: prompt + fileContext }],
        stream: true,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      res.write(`data: ${JSON.stringify({ error: err })}\n\n`);
      return res.end();
    }

    const reader  = upstream.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (err) {
    console.error('Builder generate error:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// ── POST /api/metering/deduct ─────────────────────────
app.post('/api/metering/deduct', async (req, res) => {
  const { seconds, user_id } = req.body;
  if (!seconds || !user_id) return res.status(400).json({ error: 'seconds and user_id required' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Bearer token required' });

  try {
    // Fetch current usage
    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.${user_id}&select=compute_minutes_used,tier`,
      {
        headers: {
          apikey:        SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!profileRes.ok) return res.status(500).json({ error: 'Profile fetch failed' });

    const profiles = await profileRes.json();
    const profile  = profiles[0];
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const addedMinutes = seconds / 60;
    const newUsed = (profile.compute_minutes_used || 0) + addedMinutes;

    // Update
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.${user_id}`,
      {
        method:  'PATCH',
        headers: {
          apikey:          SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY,
          Authorization:   `Bearer ${token}`,
          'Content-Type':  'application/json',
          Prefer:          'return=representation',
        },
        body: JSON.stringify({ compute_minutes_used: newUsed }),
      }
    );

    const updated = await updateRes.json();
    res.json({ success: true, compute_minutes_used: newUsed, deducted_seconds: seconds });
  } catch (err) {
    console.error('Metering deduct error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/builder/compute-quota ───────────────────
app.get('/api/builder/compute-quota', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.json({ minutesLeft: 30, tier: 'guest' }); // Guest allowance

  const TIER_LIMITS = { free: 100, starter: 500, pro: 2000, teams: 10000, enterprise: Infinity };

  try {
    // Get user from token
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    });
    if (!userRes.ok) return res.json({ minutesLeft: 30, tier: 'guest' });
    const user = await userRes.json();

    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.${user.id}&select=compute_minutes_used,tier`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } }
    );
    const profiles = await profileRes.json();
    const profile  = profiles?.[0] || { tier: 'free', compute_minutes_used: 0 };

    const tier   = profile.tier || 'free';
    const limit  = TIER_LIMITS[tier] ?? 100;
    const used   = profile.compute_minutes_used || 0;
    const left   = Math.max(0, limit - used);

    res.json({ minutesLeft: left, minutesUsed: used, limit, tier });
  } catch (err) {
    res.json({ minutesLeft: 30, tier: 'guest', error: err.message });
  }
});

// ── POST /api/builder/save ────────────────────────────
app.post('/api/builder/save', async (req, res) => {
  const { user_id, name, content, type = 'code', vertical = 'general' } = req.body;
  if (!user_id || !content) return res.status(400).json({ error: 'user_id and content required' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  try {
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/website_builder_versions`, {
      method:  'POST',
      headers: {
        apikey:         SUPABASE_ANON_KEY,
        Authorization:  token ? `Bearer ${token}` : `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer:         'return=representation',
      },
      body: JSON.stringify({
        user_id,
        name:       name || `Build ${new Date().toLocaleDateString()}`,
        content,
        type,
        vertical,
        created_at: new Date().toISOString(),
      }),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      return res.status(500).json({ error: `Save failed: ${err}` });
    }

    const saved = await insertRes.json();
    res.json({ success: true, build: saved?.[0] || { id: crypto.randomUUID() } });
  } catch (err) {
    console.error('Builder save error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/builder/builds/:userId ──────────────────
app.get('/api/builder/builds/:userId', auth, async (req, res) => {
  const { userId } = req.params;
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  try {
    const buildsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/website_builder_versions?user_id=eq.${userId}&order=created_at.desc&limit=20`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token || SUPABASE_ANON_KEY}` } }
    );
    const builds = await buildsRes.json();
    res.json({ builds: Array.isArray(builds) ? builds : [] });
  } catch (err) {
    res.json({ builds: [] });
  }
});

// ── POST /api/builder/image — DALL-E 3 ───────────────
app.post('/api/builder/image', auth, async (req, res) => {
  const { prompt, size = '1024x1024', quality = 'standard' } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  try {
    const upstream = await fetch('https://api.openai.com/v1/images/generations', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size, quality }),
    });
    if (!upstream.ok) {
      const err = await upstream.text();
      return res.status(upstream.status).json({ error: err });
    }
    const data = await upstream.json();
    res.json({ url: data.data?.[0]?.url, revised_prompt: data.data?.[0]?.revised_prompt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/builder/voice — ElevenLabs TTS ─────────
app.post('/api/builder/voice', auth, async (req, res) => {
  const { text, voice_id = '21m00Tcm4TlvDq8ikWAM', model_id = 'eleven_turbo_v2' } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });
  if (!ELEVENLABS_KEY) return res.status(503).json({ error: 'ElevenLabs not configured' });

  try {
    const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'xi-api-key':    ELEVENLABS_KEY,
        Accept:          'audio/mpeg',
      },
      body: JSON.stringify({ text, model_id, voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      return res.status(upstream.status).json({ error: err });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const buffer = await upstream.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/builder/video — Runway Gen-3 ───────────
app.post('/api/builder/video', auth, async (req, res) => {
  const { prompt, image_url, duration = 5 } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  const RUNWAY_KEY = process.env.RUNWAY_API_KEY || '';
  if (!RUNWAY_KEY) return res.status(503).json({ error: 'Runway not configured' });

  try {
    const body = { promptText: prompt, model: 'gen3a_turbo', duration };
    if (image_url) body.promptImage = image_url;

    const upstream = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        Authorization:   `Bearer ${RUNWAY_KEY}`,
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      return res.status(upstream.status).json({ error: err });
    }

    const data = await upstream.json();
    res.json({ task_id: data.id, status: 'pending' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/builder/video/:taskId — Poll status ─────
app.get('/api/builder/video/:taskId', auth, async (req, res) => {
  const RUNWAY_KEY = process.env.RUNWAY_API_KEY || '';
  try {
    const upstream = await fetch(`https://api.dev.runwayml.com/v1/tasks/${req.params.taskId}`, {
      headers: { Authorization: `Bearer ${RUNWAY_KEY}`, 'X-Runway-Version': '2024-11-06' },
    });
    const data = await upstream.json();
    res.json({ status: data.status, output: data.output, progress: data.progress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`SaintSal Labs API Gateway v3 on port ${PORT}`);
  console.log(`Providers: Anthropic=${!!ANTHROPIC_KEY} OpenAI=${!!OPENAI_KEY} Gemini=${!!GEMINI_KEY} xAI=${!!XAI_KEY}`);
  console.log(`Builder: /api/builder/generate (tier-routed) /api/metering/deduct /api/builder/save`);
  console.log(`Social: LinkedIn=${!!LINKEDIN_CLIENT_ID} Twitter=${!!TWITTER_CONSUMER_KEY}`);
  console.log(`ElevenLabs=${!!ELEVENLABS_KEY} Runway=${!!process.env.RUNWAY_API_KEY}`);
});
