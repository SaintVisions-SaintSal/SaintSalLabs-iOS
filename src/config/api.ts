/**
 * SaintSal Labs — API Configuration
 * Points to the SAL Engine FastAPI backend
 */

// Backend base URL — change for production
export const API_BASE = __DEV__
  ? 'http://localhost:8000'
  : 'https://api.saintsallabs.com';

export const SUPABASE_URL = 'https://euxrlpuegeiggedqbkiv.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eHJscHVlZ2VpZ2dlZHFia2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MTYsImV4cCI6MjA4MTUyOTUxNn0.KpvXVTIDXeGOBOQOhdPopVbYYfjB-RgPSyJJY3IY474';

// Stripe
export const STRIPE_PUBLISHABLE_KEY = 'pk_live_51RzHypL47U80vDLAsLKUh4wwtGsldovBIdNmAh9oYA0poLgKhKnwqfjys7cKuORwoxo501i5OjLy8dsS2wGN1l6b00yqNAzP7w';

// ElevenLabs Voice Agent
export const ELEVENLABS_AGENT_ID = 'agent_5401k855rq5afqprn6vd3mh6sn7z';

// xAI / Grok API
export const XAI_API_KEY = 'xai-nHg5nPUWiBt78IZxQzWTUp8xlUYtFU7Ygz2OtfbKEh2ROke1ckosfMKFRnzVNudHLp12aw6teomzVkbt';
export const XAI_BASE_URL = 'https://api.x.ai/v1';

// SAL Model tiers
export const SAL_MODELS = {
  mini: { label: 'SAL Mini', description: 'Fast & lightweight', icon: '⚡' },
  pro: { label: 'SAL Pro', description: 'Deep analysis', icon: '🧠' },
  max: { label: 'SAL Max', description: 'Frontier intelligence', icon: '🔮' },
  max_fast: { label: 'SAL Max Fast', description: 'Parallel execution', icon: '🚀' },
} as const;

// Tier definitions
export const TIERS = {
  free: { name: 'Free', price: 0, compute: 100, color: '#6B6B7B' },
  starter: { name: 'Starter', price: 27, compute: 500, color: '#4A9EFF' },
  pro: { name: 'Pro', price: 97, compute: 2000, color: '#D4A017' },
  teams: { name: 'Teams', price: 297, compute: 10000, color: '#8B5CF6' },
  enterprise: { name: 'Enterprise', price: 497, compute: -1, color: '#FF4757' },
} as const;

// Verticals
export const VERTICALS = [
  { id: 'finance', name: 'Finance', icon: '📊', color: '#00D68F', description: 'Markets, watchlists, SEC filings' },
  { id: 'sports', name: 'Sports', icon: '🏈', color: '#FF8C42', description: 'Scores, stats, favorites' },
  { id: 'real_estate', name: 'Real Estate', icon: '🏠', color: '#4A9EFF', description: 'Properties, deal analysis' },
  { id: 'news', name: 'News', icon: '📰', color: '#8B5CF6', description: 'Breaking news intelligence' },
  { id: 'medical', name: 'Medical', icon: '🏥', color: '#FF4757', description: 'ICD-10, NPI, clinical' },
  { id: 'tech', name: 'Tech', icon: '💻', color: '#2DD4BF', description: 'Code, docs, debugging' },
] as const;
