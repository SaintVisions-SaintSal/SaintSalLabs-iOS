/* ═══════════════════════════════════════════════════
   SAINTSALLABS — API CLIENT
   XHR streaming (works in React Native / Hermes)
   Connects to SaintSalLabs-API gateway
═══════════════════════════════════════════════════ */

// Your deployed API gateway URL (Render or Vercel)
export const API_BASE = 'https://saintsallabs-api.onrender.com';
export const API_KEY  = 'sal-live-2026';

const HEADERS = {
  'Content-Type': 'application/json',
  'x-sal-key': API_KEY,
};

/* ─── XHR SSE Streaming (React Native compatible) ─── */
export const streamChat = ({ provider = 'anthropic', model, system, messages, onChunk, onDone, onError }) => {
  const endpoints = {
    anthropic: `${API_BASE}/api/chat/anthropic`,
    xai:       `${API_BASE}/api/chat/xai`,
    openai:    `${API_BASE}/api/chat/openai`,
  };

  const url = endpoints[provider] || endpoints.anthropic;
  const xhr = new XMLHttpRequest();
  let processed = 0;

  xhr.open('POST', url, true);
  Object.entries(HEADERS).forEach(([k, v]) => xhr.setRequestHeader(k, v));

  xhr.onprogress = () => {
    const newText = xhr.responseText.slice(processed);
    processed = xhr.responseText.length;
    const lines = newText.split('\n');
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') { onDone?.(); return; }
      try {
        const d = JSON.parse(raw);
        // Anthropic format
        if (d.type === 'content_block_delta' && d.delta?.text) {
          onChunk(d.delta.text);
        }
        // OpenAI/Grok/xAI format
        else if (d.choices?.[0]?.delta?.content) {
          onChunk(d.choices[0].delta.content);
        }
      } catch {}
    }
  };

  xhr.onload  = () => onDone?.();
  xhr.onerror = () => onError?.('Connection failed. Check your network.');
  xhr.ontimeout = () => onError?.('Request timed out.');
  xhr.timeout = 120000; // 2 min

  xhr.send(JSON.stringify({ model, system, messages, max_tokens: 4096, stream: true }));
  return xhr; // return for cancellation
};

/* ─── SAL Chat (routed through Labs API Gateway) ─── */
export const SAL_BACKEND = 'https://saintsallabs-api.onrender.com';

export const streamSalChat = ({ mode = 'creative', messages, system, onChunk, onDone, onError }) => {
  // Model + provider routing by mode
  const routeMap = {
    creative:   { provider: 'anthropic', model: 'claude-sonnet-4-6' },
    finance:    { provider: 'anthropic', model: 'claude-sonnet-4-6' },
    realestate: { provider: 'anthropic', model: 'claude-sonnet-4-6' },
    global:     { provider: 'xai',       model: 'grok-3-mini' },
  };
  const { provider, model } = routeMap[mode] || routeMap.creative;

  // Route through the Labs API gateway chat endpoint
  const endpointMap = {
    anthropic: `${SAL_BACKEND}/api/chat/anthropic`,
    xai:       `${SAL_BACKEND}/api/chat/xai`,
    openai:    `${SAL_BACKEND}/api/chat/openai`,
  };

  const xhr = new XMLHttpRequest();
  let processed = 0;

  xhr.open('POST', endpointMap[provider] || endpointMap.anthropic, true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onprogress = () => {
    const newText = xhr.responseText.slice(processed);
    processed = xhr.responseText.length;
    const lines = newText.split('\n');
    for (const line of lines) {
      // Handle non-streaming JSON response: {"success":true,"content":"..."}
      if (!line.startsWith('data: ')) {
        try {
          const d = JSON.parse(line.trim());
          if (d.success && d.content) { onChunk(d.content); onDone?.(); return; }
        } catch {}
        continue;
      }
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') { onDone?.(); return; }
      try {
        const d = JSON.parse(raw);
        if (d.type === 'content_block_delta' && d.delta?.text) {
          onChunk(d.delta.text);
        } else if (d.choices?.[0]?.delta?.content) {
          onChunk(d.choices[0].delta.content);
        } else if (d.content) {
          onChunk(d.content);
        }
      } catch {}
    }
  };

  xhr.onload = () => {
    // If stream mode didn't fire, try to parse full response
    try {
      const d = JSON.parse(xhr.responseText);
      if (d.success && d.content && processed === 0) onChunk(d.content);
    } catch {}
    onDone?.();
  };
  xhr.onerror   = () => onError?.('Connection failed. Check your network.');
  xhr.ontimeout = () => onError?.('Request timed out.');
  xhr.timeout   = 120000;

  xhr.send(JSON.stringify({ model, system, messages, max_tokens: 4096, stream: true }));
  return xhr;
};

/* ─── Builder streaming (through anthropic endpoint) ─ */
export const streamBuilder = ({ prompt, files, system, onChunk, onDone, onError }) => {
  const fileContext = files?.length
    ? '\n\nEXISTING FILES:\n' + files.map(f => `\`\`\`${f.lang} ${f.name}\n${f.content}\n\`\`\``).join('\n\n')
    : '';

  return streamChat({
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    system,
    messages: [{ role: 'user', content: prompt + fileContext }],
    onChunk,
    onDone,
    onError,
  });
};

/* ─── Social content (JSON response, non-streaming) ── */
export const generateSocial = async ({ prompt, platforms }) => {
  const platformHints = {
    twitter:   '280 chars max, punchy hook, 1-2 hashtags',
    linkedin:  'Professional story, 1300 chars optimal, thought leadership tone',
    instagram: 'Visual-first copy, emojis, 20-30 relevant hashtags at end',
    tiktok:    'Hook in first line, conversational script-style, strong CTA',
    facebook:  'Conversational, question hooks, community-focused',
  };

  const systemPrompt = "You are SAL Social Studio — expert social media strategist. Generate platform-native posts. Respond ONLY with valid JSON — no markdown, no preamble, no backticks. Just raw JSON.";
  const userPrompt = `Create platform-native posts for: "${prompt}"\n\nPlatforms: ${platforms.join(', ')}\n\nGuidelines:\n${platforms.map(p => `${p}: ${platformHints[p] || ''}`).join('\n')}\n\nReturn ONLY valid JSON: {"twitter":"...","linkedin":"...","instagram":"...","tiktok":"...","facebook":"..."}\nOnly include requested platforms.`;

  const res = await fetch(`${API_BASE}/api/chat/openai`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2000,
    }),
  });

  const data = await res.json();
  const raw = (data.choices?.[0]?.message?.content || '{}')
    .replace(/```json\n?/g, '').replace(/```/g, '').trim();
  return JSON.parse(raw);
};

/* ─── Gemini search with web grounding ────────────── */
export const searchGemini = async (query) => {
  const res = await fetch(`${API_BASE}/api/search/gemini`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json(); // { answer, sources }
};

/* ─── LinkedIn OAuth ──────────────────────────────── */
export const getLinkedInAuthUrl = async () => {
  const res = await fetch(`${API_BASE}/api/social/linkedin/auth`, { headers: HEADERS });
  return res.json(); // { url, state }
};

export const exchangeLinkedInCode = async (code, state) => {
  const res = await fetch(`${API_BASE}/api/social/linkedin/callback`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ code, state }),
  });
  return res.json(); // { access_token, name, email, profile_id }
};

/* ─── Direct Social Posting ──────────────────────── */
export const postToLinkedIn = async ({ access_token, content }) => {
  const res = await fetch(`${API_BASE}/api/social/linkedin/post`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ access_token, content }),
  });
  return res.json();
};

export const postToTwitter = async ({ content }) => {
  const res = await fetch(`${API_BASE}/api/social/twitter/post`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ content }),
  });
  return res.json();
};

export const verifyTwitter = async () => {
  const res = await fetch(`${API_BASE}/api/social/twitter/verify`, { headers: HEADERS });
  return res.json();
};

/* ─── Server-side Social Generation ──────────────── */
export const generateSocialServer = async ({ prompt, platforms, tone }) => {
  const res = await fetch(`${API_BASE}/api/social/generate`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ prompt, platforms, tone }),
  });
  return res.json();
};

/* ─── Social Status ──────────────────────────────── */
export const getSocialStatus = async () => {
  const res = await fetch(`${API_BASE}/api/social/status`, { headers: HEADERS });
  return res.json();
};

/* ─── Health check ────────────────────────────────── */
export const checkHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`, { headers: { 'x-sal-key': API_KEY } });
    return res.json();
  } catch {
    return { status: 'offline' };
  }
};
