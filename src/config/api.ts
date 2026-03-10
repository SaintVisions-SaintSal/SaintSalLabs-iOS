/**
 * SaintSal Labs — API Configuration
 * Direct API keys for real AI providers
 */

// ─── AI Provider Keys ────────────────────────────────────────
export const ANTHROPIC_API_KEY = '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';
export const OPENAI_API_KEY = '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';
export const GEMINI_API_KEY = 'AIzaSyDZOserUM2HQfXVDmlV_l_A2d8q9Gbb0RI';
export const XAI_API_KEY = 'xai-nHg5nPUWiBt78IZxQzWTUp8xlUYtFU7Ygz2OtfbKEh2ROke1ckosfMKFRnzVNudHLp12aw6teomzVkbt';

// ─── Supabase ────────────────────────────────────────────────
export const SUPABASE_URL = 'https://euxrlpuegeiggedqbkiv.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eHJscHVlZ2VpZ2dlZHFia2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MTYsImV4cCI6MjA4MTUyOTUxNn0.KpvXVTIDXeGOBOQOhdPopVbYYfjB-RgPSyJJY3IY474';

// ─── Stripe ──────────────────────────────────────────────────
export const STRIPE_PUBLISHABLE_KEY = 'pk_live_51RzHypL47U80vDLAsLKUh4wwtGsldovBIdNmAh9oYA0poLgKhKnwqfjys7cKuORwoxo501i5OjLy8dsS2wGN1l6b00yqNAzP7w';

// ─── ElevenLabs Voice Agent ──────────────────────────────────
export const ELEVENLABS_AGENT_ID = 'agent_5401k855rq5afqprn6vd3mh6sn7z';

// ─── SAL Model Tiers ─────────────────────────────────────────
// Maps our tier names to actual provider models
export const SAL_MODELS = {
  mini: {
    label: 'SAL Mini',
    description: 'Fast & lightweight',
    icon: '⚡',
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
  },
  pro: {
    label: 'SAL Pro',
    description: 'Deep analysis',
    icon: '🧠',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
  },
  max: {
    label: 'SAL Max',
    description: 'Frontier intelligence',
    icon: '🔮',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
  },
  max_fast: {
    label: 'SAL Max Fast',
    description: 'Grok-3 parallel execution',
    icon: '🚀',
    provider: 'xai',
    model: 'grok-3',
  },
} as const;

// ─── Pricing Tiers ───────────────────────────────────────────
export const TIERS = {
  free: { name: 'Free', price: 0, compute: 100, color: '#6B6B7B' },
  starter: { name: 'Starter', price: 27, compute: 500, color: '#D4A017' },
  pro: { name: 'Pro', price: 97, compute: 2000, color: '#D4A017' },
  teams: { name: 'Teams', price: 297, compute: 10000, color: '#8B5CF6' },
  enterprise: { name: 'Enterprise', price: 497, compute: -1, color: '#FF4757' },
} as const;

// ─── Verticals ───────────────────────────────────────────────
export const VERTICALS = [
  { id: 'finance', name: 'Finance', icon: '📊', color: '#00D68F', description: 'Markets, watchlists, SEC filings' },
  { id: 'sports', name: 'Sports', icon: '🏈', color: '#FF8C42', description: 'Scores, stats, favorites' },
  { id: 'real_estate', name: 'Real Estate', icon: '🏠', color: '#D4A017', description: 'Properties, deal analysis' },
  { id: 'news', name: 'News', icon: '📰', color: '#8B5CF6', description: 'Breaking news intelligence' },
  { id: 'medical', name: 'Medical', icon: '🏥', color: '#FF4757', description: 'ICD-10, NPI, clinical' },
  { id: 'tech', name: 'Tech', icon: '💻', color: '#2DD4BF', description: 'Code, docs, debugging' },
] as const;

// ─── SAL Builder System Prompt ───────────────────────────────
export const BUILDER_SYSTEM_PROMPT = `You are SAL Builder — the world's best full-stack AI engineer embedded in SaintSal™ Labs. You operate like bolt.new or v0.dev.

When asked to build something:
1. Start with a brief architecture overview (2-3 sentences)
2. Generate ALL files needed, each in a properly labeled code block
3. Label every code block with the file path: e.g. \`\`\`jsx src/App.jsx  or  \`\`\`html index.html
4. Include package.json, README.md, and setup instructions
5. Code must be complete, production-ready, and immediately deployable

For React/Next.js apps: use Tailwind for styling, include complete JSX with all imports
For landing pages: use a single index.html with embedded CSS and JS
For APIs: include configuration files

After code, provide:
- Deploy steps
- Environment variables needed
- One-line setup command

Always be specific, complete, and production-grade. Never use placeholder comments.`;

// ─── SAL Chat System Prompt ──────────────────────────────────
export const SAL_SYSTEM_PROMPT = `You are SAL — SaintSal™ Labs' AI assistant. Built by SaintVision Technologies (US Patent #10,290,222, HACP Protocol).

You are expert across: finance, real estate, sports analytics, medical coding, technology, and general intelligence.

Respond with precision, depth, and clarity. Format with markdown when helpful. Cite sources when relevant.

Key facts about your platform:
- 51 AI models across 4 compute tiers
- Built on HACP (Human-AI Connection Protocol)
- Patent #10,290,222 by Ryan "Cap" Capatosto
- SaintVision Technologies, Huntington Beach, CA`;
