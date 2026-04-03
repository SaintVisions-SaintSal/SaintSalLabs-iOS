/* ═══════════════════════════════════════════════════
   SAINTSALLABS — API CLIENT  (Build #78)
   MCP Gateway Only · XHR SSE Streaming · No Client Keys
   US Patent #10,290,222 · HACP Protocol
═══════════════════════════════════════════════════ */

// ── Primary: MCP Gateway on Python backend (saintsallabs.com) ──
export const MCP_BASE = 'https://www.saintsallabs.com';
export const MCP_KEY  = 'saintvision_gateway_2025';

// ── Legacy: Render gateway (voice, social post) ──
export const API_BASE = 'https://saintsallabs-api.onrender.com';
export const API_KEY  = 'sal-live-2026';

const HEADERS = {
  'Content-Type': 'application/json',
  'x-sal-key': API_KEY,
};

const MCP_HEADERS = {
  'Content-Type': 'application/json',
  'x-sal-key': MCP_KEY,
};


/* ═══════════════════════════════════════════════════
   SECTION 1: AGENT SSE — THE NEW BUILDER PIPELINE
   XHR-based SSE consumer for /api/builder/agent
   Hermes-compatible (no ReadableStream, no EventSource)
═══════════════════════════════════════════════════ */

/**
 * Connect to the agentic builder SSE endpoint.
 *
 * @param {Object} opts
 * @param {string} opts.prompt       — User's build request
 * @param {string} [opts.mode]       — 'supergrok' (default) or 'quick'
 * @param {Array}  [opts.files]      — Existing project files for context
 * @param {string} [opts.projectId]  — Existing project ID for continuity
 *
 * Callbacks (all optional):
 * @param {Function} opts.onPlanning     — ({agent, message})
 * @param {Function} opts.onPlanReady    — ({agent, plan: {title, components, apis, steps, complexity, estimated_time}})
 * @param {Function} opts.onBuilding     — ({agent, message})
 * @param {Function} opts.onStitchReady  — ({agent, design})
 * @param {Function} opts.onWiring       — ({agent, message})
 * @param {Function} opts.onFilesReady   — ({agent, files: [{name, content}], model})
 * @param {Function} opts.onComplete     — ({message, model})
 * @param {Function} opts.onError        — (errorMessage: string)
 *
 * @returns {{ abort: () => void }}
 */
export function connectAgentSSE({
  prompt,
  mode = 'supergrok',
  files,
  projectId,
  onPlanning,
  onPlanReady,
  onBuilding,
  onStitchReady,
  onWiring,
  onFilesReady,
  onComplete,
  onError,
}) {
  let cancelled = false;
  const handle = { abort: () => { cancelled = true; xhr.abort(); } };

  const xhr = new XMLHttpRequest();
  let lastIndex = 0;
  let eventBuffer = '';

  xhr.open('POST', `${MCP_BASE}/api/builder/agent`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('x-sal-key', MCP_KEY);
  xhr.setRequestHeader('Accept', 'text/event-stream');
  xhr.timeout = 300000; // 5 min for complex full-stack builds

  /* ── Parse SSE events from XHR responseText delta ── */
  xhr.onprogress = () => {
    if (cancelled) return;

    const newData = xhr.responseText.slice(lastIndex);
    lastIndex = xhr.responseText.length;
    eventBuffer += newData;

    // Split on double-newline (SSE event boundary)
    const parts = eventBuffer.split('\n\n');
    // Last element may be incomplete — keep it in buffer
    eventBuffer = parts.pop() || '';

    for (const raw of parts) {
      if (!raw.trim()) continue;
      processSSEEvent(raw);
    }
  };

  /* ── Route parsed events to callbacks ──
     Backend sends two formats:
     Format A: event: planning\ndata: {...}\n\n   (with event: header)
     Format B: data: {"phase":"planning",...}\n\n  (phase inside JSON payload)
     We support BOTH — check event: header first, fall back to data.phase ── */
  function processSSEEvent(raw) {
    const eventMatch = raw.match(/^event:\s*(.+)$/m);
    const dataMatch = raw.match(/^data:\s*(.+)$/m);

    if (!dataMatch) return; // Malformed event, skip

    let data;
    try {
      data = JSON.parse(dataMatch[1].trim());
    } catch (e) {
      // Data line wasn't valid JSON — might be a plain text message
      data = { message: dataMatch[1].trim() };
    }

    // Resolve event type: prefer event: header, fall back to data.phase
    const eventType = eventMatch
      ? eventMatch[1].trim()
      : (data.phase || data.event || 'message');

    switch (eventType) {
      case 'planning':
        onPlanning?.(data);
        break;
      case 'plan_ready':
        onPlanReady?.(data);
        break;
      case 'building':
        onBuilding?.(data);
        break;
      case 'stitch_ready':
        onStitchReady?.(data);
        break;
      case 'wiring':
        onWiring?.(data);
        break;
      case 'files_ready':
        onFilesReady?.(data);
        break;
      case 'complete':
        onComplete?.(data);
        break;
      case 'error':
        onError?.(data.message || data.error || 'Pipeline error');
        break;
      default:
        // Unknown event type — ignore gracefully
        break;
    }
  }

  /* ── Completion / error handlers ── */
  xhr.onload = () => {
    if (cancelled) return;
    // Process any remaining buffered data
    if (eventBuffer.trim()) {
      processSSEEvent(eventBuffer);
      eventBuffer = '';
    }
    // If we never got a 'complete' event, check status
    if (xhr.status !== 200) {
      onError?.(`Server returned ${xhr.status}`);
    }
  };

  xhr.onerror = () => {
    if (!cancelled) onError?.('Network error — check connection');
  };

  xhr.ontimeout = () => {
    if (!cancelled) onError?.('Build timed out. Try again or simplify the prompt.');
  };

  /* ── Send request ── */
  const body = {
    prompt,
    mode,
    ...(files?.length ? { files } : {}),
    ...(projectId ? { project_id: projectId } : {}),
  };

  xhr.send(JSON.stringify(body));
  return handle;
}


/* ═══════════════════════════════════════════════════
   SECTION 2: MCP GATEWAY CHAT (unchanged)
   Claude → xAI → Gemini cascade fallback (server-side)
═══════════════════════════════════════════════════ */

/* ─── MCP Chat (non-streaming, universal) ────────── */
export const mcpChat = async ({ message, model = 'pro', vertical = 'general', history = [] }) => {
  const res = await fetch(`${MCP_BASE}/api/mcp/chat`, {
    method: 'POST',
    headers: MCP_HEADERS,
    body: JSON.stringify({ message, model, vertical, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `MCP error ${res.status}`);
  }
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'MCP returned error');
  return data;
};

/* ─── Simulated streaming via MCP (word-drip) ───── */
function mcpStream({ message, model, vertical, history, onChunk, onDone, onError }) {
  let cancelled = false;
  const handle = { abort: () => { cancelled = true; } };

  (async () => {
    try {
      const res = await fetch(`${MCP_BASE}/api/mcp/chat`, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({ message, model: model || 'pro', vertical: vertical || 'general', history: history || [] }),
      });
      if (cancelled) return;
      if (!res.ok) { onError?.(`Server error ${res.status}`); return; }
      const data = await res.json();
      if (cancelled) return;
      if (!data.ok) { onError?.(data.error || 'MCP error'); return; }

      const words = (data.response || '').split(/( )/);
      for (let i = 0; i < words.length; i++) {
        if (cancelled) return;
        onChunk(words[i]);
        if (i % 3 === 0) await new Promise(r => setTimeout(r, 12));
      }
      onDone?.();
    } catch (err) {
      if (!cancelled) onError?.(err.message || 'Network error');
    }
  })();

  return handle;
}

/* ─── streamChat — primary chat streaming via MCP ── */
export const streamChat = ({ provider = 'anthropic', model, system, messages, onChunk, onDone, onError }) => {
  const lastUser = messages.filter(m => m.role === 'user').pop();
  const message = lastUser?.content || '';
  const history = messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
  return mcpStream({ message, model: 'pro', vertical: 'general', history, onChunk, onDone, onError });
};

/* ─── SAL Chat (mode-routed) ─────────────────────── */
export const SAL_BACKEND = MCP_BASE;

/**
 * Stream chat via /api/chat — the SEARCH-ENABLED endpoint.
 * Uses XHR for Hermes SSE compatibility.
 * Backend does: Tavily search → Perplexity research → Gemini/Claude/Grok stream.
 * Returns real web data, sources, and citations.
 */
export const streamSalChat = ({ mode = 'creative', messages, system, onChunk, onDone, onError, onSources }) => {
  const verticalMap = {
    creative: 'search', finance: 'finance', realestate: 'realestate',
    global: 'search', sports: 'sports', news: 'news', tech: 'tech',
    medical: 'medical', all: 'search', cookin: 'search',
  };
  const vertical = verticalMap[mode] || 'search';
  const lastUser = messages.filter(m => m.role === 'user').pop();
  const message = lastUser?.content || '';
  const history = messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));

  let cancelled = false;
  const xhr = new XMLHttpRequest();
  const handle = { abort: () => { cancelled = true; xhr.abort(); } };

  xhr.open('POST', `${MCP_BASE}/api/chat`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Accept', 'text/event-stream');
  xhr.timeout = 60000;

  let lastIndex = 0;
  let eventBuffer = '';

  xhr.onprogress = () => {
    if (cancelled) return;
    const newData = xhr.responseText.slice(lastIndex);
    lastIndex = xhr.responseText.length;
    eventBuffer += newData;
    const parts = eventBuffer.split('\n\n');
    eventBuffer = parts.pop() || '';
    for (const raw of parts) {
      if (!raw.trim()) continue;
      const dataMatch = raw.match(/^data:\s*(.+)$/m);
      if (!dataMatch) continue;
      try {
        const d = JSON.parse(dataMatch[1].trim());
        if (d.type === 'text' && d.content) onChunk?.(d.content);
        else if (d.type === 'sources' && d.sources) onSources?.(d.sources);
        else if (d.type === 'done') onDone?.();
      } catch {}
    }
  };

  xhr.onload = () => {
    if (cancelled) return;
    if (eventBuffer.trim()) {
      const dataMatch = eventBuffer.match(/^data:\s*(.+)$/m);
      if (dataMatch) {
        try {
          const d = JSON.parse(dataMatch[1].trim());
          if (d.type === 'text' && d.content) onChunk?.(d.content);
        } catch {}
      }
      eventBuffer = '';
    }
    onDone?.();
  };

  xhr.onerror = () => { if (!cancelled) onError?.('Network error'); };
  xhr.ontimeout = () => { if (!cancelled) onError?.('Request timed out'); };

  xhr.send(JSON.stringify({ message, vertical, history, search: true }));
  return handle;
};

/* ─── Builder streaming (Quick Build, non-SSE) ──── */
export const streamBuilder = ({ prompt, files, system, onChunk, onDone, onError }) => {
  const fileContext = files?.length
    ? '\n\nEXISTING FILES:\n' + files.map(f => `\`\`\`${f.lang} ${f.name}\n${f.content}\n\`\`\``).join('\n\n')
    : '';
  return mcpStream({ message: prompt + fileContext, model: 'pro', vertical: 'general', onChunk, onDone, onError });
};


/* ═══════════════════════════════════════════════════
   SECTION 3: SOCIAL, SEARCH, OAUTH (unchanged)
═══════════════════════════════════════════════════ */

/* ─── Social content (JSON response) ─────────────── */
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
  const mcpRes = await mcpChat({ message: `${systemPrompt}\n\n${userPrompt}`, model: 'pro', vertical: 'general' });
  const raw = (mcpRes.response || '{}').replace(/```json\n?/g, '').replace(/```/g, '').trim();
  return JSON.parse(raw);
};

/* ─── Gemini search ──────────────────────────────── */
export const searchGemini = async (query) => {
  const res = await fetch(`${MCP_BASE}/api/search/gemini`, { method: 'POST', headers: MCP_HEADERS, body: JSON.stringify({ query }) });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
};

/* ─── LinkedIn OAuth ─────────────────────────────── */
export const getLinkedInAuthUrl = async () => {
  const res = await fetch(`${API_BASE}/api/social/linkedin/auth`, { headers: HEADERS });
  return res.json();
};

export const exchangeLinkedInCode = async (code, state) => {
  const res = await fetch(`${API_BASE}/api/social/linkedin/callback`, { method: 'POST', headers: HEADERS, body: JSON.stringify({ code, state }) });
  return res.json();
};

/* ─── Direct Social Posting ──────────────────────── */
export const postToLinkedIn = async ({ access_token, content }) => {
  const res = await fetch(`${API_BASE}/api/social/linkedin/post`, { method: 'POST', headers: HEADERS, body: JSON.stringify({ access_token, content }) });
  return res.json();
};

export const postToTwitter = async ({ content }) => {
  const res = await fetch(`${API_BASE}/api/social/twitter/post`, { method: 'POST', headers: HEADERS, body: JSON.stringify({ content }) });
  return res.json();
};

export const verifyTwitter = async () => {
  const res = await fetch(`${API_BASE}/api/social/twitter/verify`, { headers: HEADERS });
  return res.json();
};

/* ─── Server-side Social Generation ──────────────── */
export const generateSocialServer = async ({ prompt, platforms, tone }) => {
  const res = await fetch(`${API_BASE}/api/social/generate`, { method: 'POST', headers: HEADERS, body: JSON.stringify({ prompt, platforms, tone }) });
  return res.json();
};

/* ─── Social Status ──────────────────────────────── */
export const getSocialStatus = async () => {
  const res = await fetch(`${API_BASE}/api/social/status`, { headers: HEADERS });
  return res.json();
};

/* ─── Google Stitch (through MCP gateway) ────────── */
export const stitchGenerate = async ({ prompt, mode = 'flash' }) => {
  const res = await fetch(`${MCP_BASE}/api/mcp/chat`, {
    method: 'POST',
    headers: MCP_HEADERS,
    body: JSON.stringify({ message: prompt, model: mode === 'ultra' ? 'stitch_ultra' : mode === 'pro' ? 'stitch_pro' : 'stitch_flash', vertical: 'design' }),
  });
  if (!res.ok) throw new Error(`Stitch error ${res.status}`);
  const data = await res.json();
  return { ok: data.ok, content: data.response, model: data.model };
};


/* ═══════════════════════════════════════════════════
   SECTION 4: METERING & HEALTH (unchanged)
═══════════════════════════════════════════════════ */

export const checkHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`, { headers: { 'x-sal-key': API_KEY } });
    return res.json();
  } catch { return { status: 'offline' }; }
};

export const checkComputeQuota = async (accessToken) => {
  try {
    const res = await fetch(`${MCP_BASE}/api/builder/compute-quota`, {
      headers: { 'x-sal-key': MCP_KEY, ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    });
    if (!res.ok) return { minutesLeft: 30, tier: 'guest' };
    return res.json();
  } catch { return { minutesLeft: 30, tier: 'guest' }; }
};

export const deductComputeSeconds = async (seconds, userId, accessToken) => {
  try {
    await fetch(`${MCP_BASE}/api/metering/deduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-sal-key': MCP_KEY, ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({ seconds, user_id: userId }),
    });
  } catch (e) { console.warn('[metering] deduct error:', e.message); }
};

/* ─── Builder generate (Quick Build, tier-routed) ── */
export const streamBuilderGenerate = ({ prompt, tier = 'free', type = 'code', files, system, onChunk, onDone, onError }) => {
  const fileContext = files?.length
    ? '\n\nEXISTING FILES:\n' + files.map(f => `\`\`\`${f.language || f.lang || ''} ${f.path || f.name || ''}\n${f.content}\n\`\`\``).join('\n\n')
    : '';
  return mcpStream({ message: prompt + fileContext, model: tier === 'max' ? 'max' : 'pro', vertical: 'general', onChunk, onDone, onError });
};
