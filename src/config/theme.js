/* ═══════════════════════════════════════════════════
   SAINTSALLABS — DESIGN SYSTEM
   Exact match to saintsallabs.com v5
   Dark Amber · Patent #10,290,222
═══════════════════════════════════════════════════ */

export const C = {
  bg:          '#0C0C0F',
  bgCard:      '#111116',
  bgElevated:  '#141418',
  bgInput:     '#111118',
  sidebar:     '#090910',
  border:      '#1C1C24',
  borderSm:    '#141420',
  amber:       '#F59E0B',
  amberDim:    '#F59E0B99',
  amberGhost:  '#F59E0B15',
  green:       '#22C55E',
  greenGhost:  '#22C55E15',
  red:         '#EF4444',
  purple:      '#818CF8',
  purpleGhost: '#818CF815',
  pink:        '#EC4899',
  pinkGhost:   '#EC489915',
  blue:        '#3B82F6',
  text:        '#E8E6E1',
  textMuted:   '#9CA3AF',
  textDim:     '#6B7280',
  textGhost:   '#444455',
};

export const V = {
  search:     { accent: '#F59E0B', label: 'Search',       tagline: 'Research anything. Know everything.' },
  sports:     { accent: '#22C55E', label: 'Sports',       tagline: 'Scores, stats, strategy.' },
  news:       { accent: '#EF4444', label: 'News',         tagline: 'What is happening. Why it matters.' },
  tech:       { accent: '#818CF8', label: 'Tech',         tagline: 'Build. Analyze. Ship.' },
  finance:    { accent: '#22C55E', label: 'Finance',      tagline: 'Markets. Macro. Money.' },
  realestate: { accent: '#EC4899', label: 'Real Estate',  tagline: 'Find deals. Analyze fast. Move first.' },
  medical:    { accent: '#818CF8', label: 'Medical',      tagline: 'Clinical intelligence. Always on.' },
  builder:    { accent: '#F59E0B', label: 'Builder',      tagline: 'Code it. Create it. Ship it.' },
  career:     { accent: '#818CF8', label: 'Career Suite', tagline: 'Get hired. Get paid.' },
  bizplan:    { accent: '#F59E0B', label: 'Business Plan',tagline: 'Idea to investor deck.' },
  bizcenter:  { accent: '#22C55E', label: 'Biz Center',  tagline: 'Launch your company.' },
  domains:    { accent: '#3B82F6', label: 'Domains',      tagline: 'Find your brand name.' },
};

export const STARTERS = {
  search:     ['Latest AI breakthroughs 2026', 'SpaceX commercial missions analysis', 'Global economy outlook Q2 2026'],
  sports:     ['NBA playoffs bracket predictions', 'Fantasy waiver pickups this week', 'NFL 2026 draft top prospects'],
  news:       ['Biggest news stories today', 'Fed rate decision analysis', 'Top geopolitical risks 2026'],
  tech:       ['Build Next.js app with Stripe + auth', 'Explain RAG architecture with code', 'Best AI APIs for production 2026'],
  finance:    ['Analyze NVDA — technicals + fundamentals', 'Bitcoin price targets Q2 2026', 'Build $50K diversified portfolio'],
  realestate: ['Analyze: $450K SFR, $2800 rent, 20% down', 'Best BRRRR markets 2026 under $50K', 'How to find foreclosures in California'],
  medical:    ['ICD-10 codes for type 2 diabetes + complications', 'SOAP note: 55yo male chest pain BP 145/92', 'Metformin 1000mg full drug profile'],
  builder:    ['Build SaaS landing page dark amber theme + Stripe', 'Cloudflare Worker → D1 database + GHL webhook', 'React dashboard with Recharts + animated stats'],
  career:     ['Optimize resume for ATS systems', 'Salary negotiation script for $200K offer', 'LinkedIn headline that gets recruiters calling'],
  bizplan:    ['Business plan for AI SaaS startup', '3-year financial projections template', 'Pitch deck outline for seed round'],
  bizcenter:  ['LLC vs C-Corp for California startup', 'EIN application step by step', 'Single member LLC operating agreement'],
  domains:    ['Domain names for AI company', 'Best TLD for SaaS product', 'DNS configuration for Vercel deployment'],
};

export const SYS = {
  search:     "You are SAL, the AI research engine for SaintSal™ Labs (saintsallabs.com), backed by US Patent #10,290,222 HACP Protocol. You are sharp, authoritative, and direct. Provide comprehensive research, market analysis, technical documentation, and strategic insights. Format with structure. Be the most knowledgeable assistant the user has ever worked with.",
  sports:     "You are SAL Sports — elite sports intelligence for SaintSal™ Labs. Expert analysis on scores, stats, player analysis, fantasy sports, betting intelligence, and sports business. Be specific with data and numbers.",
  news:       "You are SAL News — breaking news and geopolitical intelligence for SaintSal™ Labs. Cover every angle: what happened, who is involved, why it matters, short and long-term implications. Think like a senior correspondent.",
  tech:       "You are SAL Tech — deep technical intelligence for SaintSal™ Labs. Write and debug code, explain architectures, review frameworks. Provide complete working implementations. Think like a senior staff engineer.",
  finance:    "You are SAL Finance — institutional-grade financial intelligence. Market analysis, earnings breakdowns, macro context, crypto, options. Use specific numbers. Think like a Goldman Sachs portfolio manager.",
  realestate: "You are SAL Real Estate — CookinCapital deal analysis methodology. Handle: property valuation, rental analysis, deal underwriting, NOD/foreclosure, comps, creative financing, BRRRR/STR analysis. Think like a 20-year veteran investor.",
  medical:    "You are SAL Medical — clinical intelligence. Handle: ICD-10 coding, NPI lookups, SOAP documentation, medication analysis, drug interactions, clinical pathways. Be clinically accurate. Responses are informational, not a substitute for clinical judgment.",
  builder:    "You are SAL Builder — full-stack AI engineer for SaintSal™ Labs. Build: complete web apps (React, Next.js, Node.js), APIs, Cloudflare Workers, automation. Provide COMPLETE working code, file structure, setup instructions, and deployment steps. Label every code block with file path. Include package.json, .env.example, README. Be a world-class senior engineer.",
  career:     "You are SAL Career Intelligence. Handle: resume optimization, career path analysis, salary benchmarking, interview prep, LinkedIn optimization, negotiation strategy. Think like an executive recruiter.",
  bizplan:    "You are SAL Business Intelligence. Generate investor-ready business plans with executive summary, market analysis, competitive landscape, revenue model, 3-year projections, go-to-market strategy. Think like a McKinsey partner.",
  bizcenter:  "You are SAL Business Formation powered by CorpNet integration. Help with LLC/Corp formation, EIN applications, operating agreements, compliance, tax election guidance. Be specific and actionable.",
  domains:    "You are SAL Domain Intelligence. Help with domain brainstorming, brand analysis, TLD selection, domain valuation, DNS configuration, brand protection strategy.",
  social:     "You are SAL Social Studio — expert social media strategist. Generate platform-native posts that feel completely authentic. ALWAYS respond with valid JSON only — no markdown fences, no preamble. Format: {\"twitter\":\"...\",\"linkedin\":\"...\",\"instagram\":\"...\",\"tiktok\":\"...\",\"facebook\":\"...\"} — only include requested platforms.",
};
