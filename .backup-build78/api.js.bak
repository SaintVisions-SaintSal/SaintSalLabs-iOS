/* ═══════════════════════════════════════════════════
   SAINTSALLABS — API CLIENT  (Build #70)
   Dual backend: MCP gateway (primary) + Render gateway (legacy)
   XHR streaming (works in React Native / Hermes)
═══════════════════════════════════════════════════ */

// ── Primary: MCP Gateway on Python backend (saintsallabs.com) ──
export const MCP_BASE = 'https://saintsallabs.com';
export const MCP_KEY  = 'saintvision_gateway_2025';

// ── Legacy: Render gateway (still used for voice, social post, builder v2) ──
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

/* ─── MCP Chat (non-streaming, universal) ────────── */
// All AI chat goes through the MCP gateway which has
// Claude → xAI → Gemini cascade fallback built in.
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
  return data; // { ok, response, model, fallback? }
};

/* ─── Simulated streaming via MCP (non-streaming endpoint) ───
   Calls MCP gateway, gets full response, then drips tokens
   to onChunk so the UI typing animation still works.
   Returns an abort handle matching the XHR cancel interface. */
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

      // Drip the response word-by-word for typing effect
      const words = (data.response || '').split(/( )/); // keep spaces
      for (let i = 0; i < words.length; i++) {
        if (cancelled) return;
        onChunk(words[i]);
        // Small delay every 3 words for natural feel
        if (i % 3 === 0) await new Promise(r => setTimeout(r, 12));
      }
      onDone?.();
    } catch (err) {
      if (!cancelled) onError?.(err.message || 'Network error');
    }
  })();

  return handle;
}

/* ─── streamChat — primary chat streaming via MCP ─── */
export const streamChat = ({ provider = 'anthropic', model, system, messages, onChunk, onDone, onError }) => {
  // Build the last user message from messages array
  const lastUser = messages.filter(m => m.role === 'user').pop();
  const message = lastUser?.content || '';
  const history = messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));

  return mcpStream({ message, model: 'pro', vertical: 'general', history, onChunk, onDone, onError });
};

/* ─── SAL Chat (mode-routed through MCP gateway) ─── */
export const SAL_BACKEND = MCP_BASE;

export const streamSalChat = ({ mode = 'creative', messages, system, onChunk, onDone, onError }) => {
  const verticalMap = {
    creative:   'creative',
    finance:    'finance',
    realestate: 'realestate',
    global:     'general',
  };
  const vertical = verticalMap[mode] || 'general';

  const lastUser = messages.filter(m => m.role === 'user').pop();
  const message = lastUser?.content || '';
  const history = messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));

  return mcpStream({ message, model: 'pro', vertical, history, onChunk, onDone, onError });
};

/* ─── Builder streaming (through MCP gateway) ────── */
export const streamBuilder = ({ prompt, files, system, onChunk, onDone, onError }) => {
  const fileContext = files?.length
    ? '\n\nEXISTING FILES:\n' + files.map(f => `\`\`\`${f.lang} ${f.name}\n${f.content}\n\`\`\``).join('\n\n')
    : '';

  return mcpStream({
    message: prompt + fileContext,
    model: 'pro',
    vertical: 'general',
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

  const mcpRes = await mcpChat({
    message: `${systemPrompt}\n\n${userPrompt}`,
    model: 'pro',
    vertical: 'general',
  });

  const raw = (mcpRes.response || '{}')
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

/* ═══════════════════════════════════════════════════
   SUPERGROK — GROK 4 DIRECT (xAI API)
   4-Agent Orchestration Engine
   US Patent #10,290,222 · HACP Protocol
═══════════════════════════════════════════════════ */
const XAI_BASE = 'https://api.x.ai/v1';
const XAI_KEY  = 'xai-nHg5nPUWiBt78IZxQzWTUp8xlUYtFU7Ygz2OtfbKEh2ROke1ckosfMKFRnzVNudHLp12aw6teomzVkbt';

const XAI_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${XAI_KEY}`,
};

/* ─── Grok 4 Chat (non-streaming, reasoning model) ─── */
export const grokChat = async ({ message, system, model = 'grok-4', temperature = 1 }) => {
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: message });

  const res = await fetch(`${XAI_BASE}/chat/completions`, {
    method: 'POST',
    headers: XAI_HEADERS,
    body: JSON.stringify({ model, messages, temperature }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Grok error ${res.status}`);
  }
  const data = await res.json();
  const choice = data.choices?.[0];
  return {
    content: choice?.message?.content || '',
    reasoning: choice?.message?.reasoning_content || '',
    model: data.model,
    usage: data.usage,
  };
};

/* ─── Grok 4 Streaming (XHR-based for React Native) ─── */
export function grokStream({ message, system, model = 'grok-4', onChunk, onReasoning, onDone, onError }) {
  let cancelled = false;
  const handle = { abort: () => { cancelled = true; } };

  (async () => {
    try {
      const messages = [];
      if (system) messages.push({ role: 'system', content: system });
      messages.push({ role: 'user', content: message });

      const res = await fetch(`${XAI_BASE}/chat/completions`, {
        method: 'POST',
        headers: XAI_HEADERS,
        body: JSON.stringify({ model, messages, stream: false, temperature: 1 }),
      });
      if (cancelled) return;
      if (!res.ok) { onError?.(`Grok error ${res.status}`); return; }
      const data = await res.json();
      if (cancelled) return;

      const choice = data.choices?.[0];
      const reasoning = choice?.message?.reasoning_content || '';
      const content = choice?.message?.content || '';

      // Drip reasoning first (the "thinking" phase users see)
      if (reasoning && onReasoning) {
        const rWords = reasoning.split(/( )/);
        for (let i = 0; i < rWords.length; i++) {
          if (cancelled) return;
          onReasoning(rWords[i]);
          if (i % 4 === 0) await new Promise(r => setTimeout(r, 8));
        }
      }

      // Then drip the final answer
      const words = content.split(/( )/);
      for (let i = 0; i < words.length; i++) {
        if (cancelled) return;
        onChunk(words[i]);
        if (i % 3 === 0) await new Promise(r => setTimeout(r, 12));
      }
      onDone?.({ reasoning, content, model: data.model, usage: data.usage });
    } catch (err) {
      if (!cancelled) onError?.(err.message || 'Grok network error');
    }
  })();

  return handle;
}

/* ─── SuperGrok 4-Agent Orchestration ─────────────────
   Simulates the Grok 4.20 multi-agent architecture:
   Captain (orchestrator) → Harper (research) → Benjamin (logic) → Lucas (creative)
   Each phase calls Grok 4 with a specialized system prompt.
   Returns real-time phase updates so users watch the AI think.
   Patent #10,290,222 covers this orchestration layer.
   ──────────────────────────────────────────────────── */
const AGENT_PROMPTS = {
  captain: `You are GROK CAPTAIN — the orchestrator agent in the SaintSal Labs SuperGrok system (US Patent #10,290,222).
Your role: Analyze the user's request, decompose it into sub-tasks, and create a strategic plan.
Be concise. Output a JSON object with: { "analysis": "brief analysis", "subtasks": [{ "agent": "harper|benjamin|lucas", "task": "specific instruction" }], "strategy": "overall approach" }`,

  harper: `You are HARPER — the Research & Facts agent in the SaintSal Labs SuperGrok system.
Your role: Validate technical choices, research best practices, check API compatibility, and provide evidence-based recommendations.
Be specific with sources and data. Focus on what actually works in production.`,

  benjamin: `You are BENJAMIN — the Logic & Code Architecture agent in the SaintSal Labs SuperGrok system.
Your role: Design system architecture, data models, API contracts, file structure, and implementation strategy.
Provide precise technical specifications. Think about performance, security, scalability. Output structured plans.`,

  lucas: `You are LUCAS — the Creative & UX agent in the SaintSal Labs SuperGrok system.
Your role: Design the user experience, component hierarchy, visual flow, copy, and interactions.
Focus on what makes users love the product. Think mobile-first, clean, premium.`,

  synthesizer: `You are GROK CAPTAIN — final synthesis phase.
You have received analysis from 3 specialized agents (Harper/Research, Benjamin/Logic, Lucas/Creative).
Synthesize their findings into a single, actionable implementation plan.
Output JSON: { "plan": "executive summary", "architecture": "system design", "files": [{ "path": "filename", "purpose": "what it does" }], "phases": [{ "name": "phase", "tasks": ["task1"] }], "techStack": ["tech1"], "timeline": "estimate" }`,
};

export async function superGrokOrchestrate({ prompt, onPhase, onAgentThinking, onAgentResult, onSynthesis, onError }) {
  const phases = ['captain', 'harper', 'benjamin', 'lucas', 'synthesizer'];
  const results = {};

  try {
    // Phase 1: Captain decomposes the task
    onPhase?.('captain', 'Analyzing request and decomposing into sub-tasks...');
    const captainResult = await grokChat({
      message: `User request: "${prompt}"\n\nDecompose this into sub-tasks for the research, logic, and creative agents.`,
      system: AGENT_PROMPTS.captain,
    });
    results.captain = captainResult;
    onAgentResult?.('captain', captainResult);

    // Parse captain's subtasks
    let subtasks = [];
    try {
      const parsed = JSON.parse(captainResult.content.replace(/```json\n?/g, '').replace(/```/g, '').trim());
      subtasks = parsed.subtasks || [];
    } catch {
      subtasks = [
        { agent: 'harper', task: `Research best practices for: ${prompt}` },
        { agent: 'benjamin', task: `Design architecture for: ${prompt}` },
        { agent: 'lucas', task: `Design UX/UI for: ${prompt}` },
      ];
    }

    // Phase 2-4: Run Harper, Benjamin, Lucas (sequentially so user sees each)
    for (const agent of ['harper', 'benjamin', 'lucas']) {
      const agentTask = subtasks.find(s => s.agent === agent)?.task || `Analyze: ${prompt}`;
      const label = agent === 'harper' ? 'Researching and validating...'
                  : agent === 'benjamin' ? 'Designing architecture and logic...'
                  : 'Crafting UX and creative direction...';

      onPhase?.(agent, label);
      onAgentThinking?.(agent);

      const agentResult = await grokChat({
        message: `Task from Captain: ${agentTask}\n\nOriginal user request: "${prompt}"\n\nCaptain's analysis: ${captainResult.content}`,
        system: AGENT_PROMPTS[agent],
      });
      results[agent] = agentResult;
      onAgentResult?.(agent, agentResult);
    }

    // Phase 5: Captain synthesizes all agent outputs
    onPhase?.('synthesizer', 'Synthesizing all agent findings into final plan...');
    const synthesisPrompt = `Original request: "${prompt}"

--- HARPER (Research) ---
${results.harper?.content || 'No research data'}

--- BENJAMIN (Logic/Architecture) ---
${results.benjamin?.content || 'No architecture data'}

--- LUCAS (Creative/UX) ---
${results.lucas?.content || 'No creative data'}

Synthesize these into a single actionable implementation plan.`;

    const synthesis = await grokChat({
      message: synthesisPrompt,
      system: AGENT_PROMPTS.synthesizer,
    });
    results.synthesis = synthesis;
    onSynthesis?.(synthesis);

    return { ok: true, results, synthesis };
  } catch (err) {
    onError?.(err.message);
    return { ok: false, error: err.message };
  }
}

/* ─── Google Stitch Design Generation ─────────────── */
const STITCH_KEY = 'AQ.Ab8RN6J06hjbP-TdeRU0rnX-gzN70Xr53XRvQA38VqgZQAL0Zg';

export const stitchGenerate = async ({ prompt, mode = 'flash' }) => {
  // Route through MCP gateway which has Stitch integration
  const res = await fetch(`${MCP_BASE}/api/mcp/chat`, {
    method: 'POST',
    headers: MCP_HEADERS,
    body: JSON.stringify({
      message: prompt,
      model: mode === 'ultra' ? 'stitch_ultra' : mode === 'pro' ? 'stitch_pro' : 'stitch_flash',
      vertical: 'design',
    }),
  });
  if (!res.ok) throw new Error(`Stitch error ${res.status}`);
  const data = await res.json();
  return { ok: data.ok, content: data.response, model: data.model };
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

/* ─── Compute quota check (call before every AI generation) ─── */
export const checkComputeQuota = async (accessToken) => {
  try {
    const res = await fetch(`${API_BASE}/api/builder/compute-quota`, {
      headers: {
        'x-sal-key': API_KEY,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
    if (!res.ok) return { minutesLeft: 30, tier: 'guest' };
    return res.json(); // { minutesLeft, minutesUsed, limit, tier }
  } catch {
    return { minutesLeft: 30, tier: 'guest' };
  }
};

/* ─── Deduct compute after generation ─────────────── */
export const deductComputeSeconds = async (seconds, userId, accessToken) => {
  try {
    await fetch(`${API_BASE}/api/metering/deduct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ seconds, user_id: userId }),
    });
  } catch (e) {
    console.warn('[metering] deduct error:', e.message);
  }
};

/* ─── Builder generate (tier-routed SSE) ─────────── */
export const streamBuilderGenerate = ({ prompt, tier = 'free', type = 'code', files, system, onChunk, onDone, onError }) => {
  const fileContext = files?.length
    ? '\n\nEXISTING FILES:\n' + files.map(f => `\`\`\`${f.language || f.lang || ''} ${f.path || f.name || ''}\n${f.content}\n\`\`\``).join('\n\n')
    : '';

  return mcpStream({
    message: prompt + fileContext,
    model: tier === 'max' ? 'max' : 'pro',
    vertical: 'general',
    onChunk,
    onDone,
    onError,
  });
};
