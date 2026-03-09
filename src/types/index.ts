/**
 * SaintSal Labs — Type Definitions
 */

export type SALModelTier = 'mini' | 'pro' | 'max' | 'max_fast';
export type UserTier = 'free' | 'starter' | 'pro' | 'teams' | 'enterprise';
export type VerticalId = 'finance' | 'sports' | 'real_estate' | 'news' | 'medical' | 'tech';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  tier: UserTier;
  credits_remaining: number;
  credits_total: number;
  stripe_customer_id?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model_used?: string;
  provider?: string;
  tokens_in?: number;
  tokens_out?: number;
  cost?: number;
  latency_ms?: number;
  timestamp: number;
  isStreaming?: boolean;
  sources?: SearchResult[];
  vertical?: VerticalId;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: SALModelTier;
  vertical?: VerticalId;
  created_at: number;
  updated_at: number;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  score: number;
  source: string;
}

export interface BuilderProject {
  id: string;
  name: string;
  prompt: string;
  files: BuilderFile[];
  framework: string;
  deploy_url?: string;
  repo_url?: string;
  created_at: number;
  updated_at: number;
}

export interface BuilderFile {
  path: string;
  content: string;
  language: string;
}

export interface SavedItem {
  id: string;
  category: string;
  title: string;
  data: Record<string, any>;
  tags: string[];
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface WatchlistQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_pct: number;
  volume: number;
  asset_type: string;
  notes: string;
  target_price: number;
}

export interface SportsTeam {
  name: string;
  league: string;
  abbreviation: string;
}

export interface GameScore {
  game_id: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  status: 'scheduled' | 'live' | 'final';
  start_time: string;
  league: string;
}
