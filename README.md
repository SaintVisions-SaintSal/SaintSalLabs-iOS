# SaintSal™ Labs — iOS App

**The AI Builder Platform by Saint Vision Technologies LLC**

> Perplexity-style AI chat + v0-style code builder + multi-source search — all in one native iOS app.

---

## Features

### 🤖 SAL Chat Engine
- Streaming AI responses with 4 model tiers (Mini / Pro / Max / Max Fast)
- 6 vertical specializations: Finance, Sports, Real Estate, News, Medical, Tech
- Source citations with inline links
- Conversation history with full persistence

### 🔨 Builder Studio
- v0-style code generation from natural language
- Framework picker (React, Next.js, React Native, Node.js, Python)
- Pre-built templates (Landing page, Dashboard, API, Chat app)
- Live code viewer with iteration loop
- Export and deploy functionality

### 🔍 Multi-Source Search
- Exa + Tavily + Azure Cognitive Search
- Deep Research toggle for comprehensive analysis
- Academic, image, and video search verticals
- Source cards with citations

### 📊 Dashboard
- Usage stats and model distribution
- Chat history, builder projects, and saved items
- Subscription management and tier display

### ⚙️ Settings & Profile
- Supabase auth (magic link + Google OAuth)
- Stripe subscription management
- Model tier preferences
- Patent and legal info display (US Patent #10,290,222)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 52 + React Native 0.76.6 |
| Language | TypeScript (strict) |
| Navigation | Expo Router v4 (file-based) |
| State | Zustand |
| Auth | Supabase + Expo SecureStore |
| Payments | Stripe |
| Backend | SAL Engine v4 (FastAPI) at api.saintsallabs.com |
| Icons | Expo Vector Icons (Ionicons) |

---

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g @expo/cli`
- EAS CLI: `npm install -g eas-cli`
- Apple Developer Account
- Xcode 15+ (for local iOS builds)

### Setup

```bash
# 1. Clone and install
cd SaintSalLabs
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your actual API keys (see SaintSalTM-3.env)

# 3. Start development server
npx expo start

# 4. Run on iOS Simulator (press 'i')
# Or scan QR code with Expo Go on your iPhone
```

### Environment Variables

Create `.env` from `.env.example`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://euxrlpuegeiggedqbkiv.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_API_BASE_URL=https://api.saintsallabs.com
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RzHypL47U80vDLAs...
EXPO_PUBLIC_ELEVENLABS_AGENT_ID=agent_5401k855rq5afqprn6vd3mh6sn7z
```

---

## TestFlight Deployment

### Step 1: EAS Login
```bash
eas login
# Login with your Expo account (owner: saintvision)
```

### Step 2: Configure EAS Project
```bash
eas init
# This will link to your Expo project and set the projectId
```

### Step 3: Configure Apple Credentials
```bash
eas credentials
# Select iOS → Production
# Choose "Log in to your Apple Developer account"
# EAS will manage certificates and provisioning profiles automatically
```

### Step 4: Build for TestFlight
```bash
# Preview build (internal testing)
eas build --platform ios --profile preview

# Production build (App Store / TestFlight)
eas build --platform ios --profile production
```

### Step 5: Submit to TestFlight
```bash
eas submit --platform ios --profile production
# This uploads the build to App Store Connect
# Then go to App Store Connect → TestFlight → manage testers
```

### Step 6: Update `eas.json` Submit Config
Before submitting, update these values in `eas.json`:
- `appleId`: Your Apple ID email
- `ascAppId`: Your App Store Connect app ID (numeric)
- `appleTeamId`: Your Apple Developer Team ID

---

## Project Structure

```
SaintSalLabs/
├── app/                          # Expo Router pages
│   ├── _layout.tsx               # Root layout (auth listener)
│   ├── index.tsx                 # Entry redirect
│   ├── auth.tsx                  # Auth screen (magic link + Google)
│   └── (tabs)/                   # Tab navigator
│       ├── _layout.tsx           # 5-tab config
│       ├── index.tsx             # → ChatScreen
│       ├── builder.tsx           # → BuilderScreen
│       ├── search.tsx            # → SearchScreen
│       ├── dashboard.tsx         # → DashboardScreen
│       └── settings.tsx          # → SettingsScreen
├── src/
│   ├── screens/                  # Full screen implementations
│   │   ├── ChatScreen.tsx        # Perplexity-style chat
│   │   ├── BuilderScreen.tsx     # v0-style builder
│   │   ├── SearchScreen.tsx      # Multi-source search
│   │   ├── DashboardScreen.tsx   # Stats & saved items
│   │   └── SettingsScreen.tsx    # Profile & settings
│   ├── components/               # Reusable UI components
│   │   ├── SALHeader.tsx         # Branded header
│   │   ├── ModelSelector.tsx     # Model tier picker
│   │   ├── ChatBubble.tsx        # Chat message bubble
│   │   ├── ChatInput.tsx         # Input bar
│   │   └── VerticalCard.tsx      # Vertical selector card
│   ├── config/
│   │   ├── theme.ts              # Design system (dark + gold)
│   │   └── api.ts                # API configuration
│   ├── lib/
│   │   ├── api.ts                # SAL Engine API client
│   │   ├── supabase.ts           # Supabase client
│   │   └── store.ts              # Zustand global state
│   └── types/
│       └── index.ts              # TypeScript definitions
├── assets/                       # Icons and splash
│   ├── icon.png                  # 1024x1024 app icon (golden AI eye)
│   ├── splash-icon.png           # 512x512 splash icon
│   ├── apple-touch-icon.png      # 180x180
│   └── favicon.png               # 48x48
├── app.json                      # Expo config
├── eas.json                      # EAS Build config
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── babel.config.js               # Babel config
├── metro.config.js               # Metro bundler config
├── .env.example                  # Environment template
└── .gitignore
```

---

## Design System

| Token | Value |
|-------|-------|
| Primary Background | `#0A0A0F` |
| Secondary Background | `#13131A` |
| Card Background | `#1A1A24` |
| Gold Accent | `#D4A017` |
| Gold Light | `#E8C547` |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#9CA3AF` |
| Success | `#10B981` |
| Error | `#EF4444` |
| Info | `#3B82F6` |
| Font Family | System (SF Pro) |

---

## Model Tiers

| Tier | Models | Monthly Price |
|------|--------|--------------|
| Mini (Free) | Claude Haiku, GPT-4o Mini, Gemini Flash | $0 |
| Pro (Starter) | Claude Sonnet, GPT-4o, Gemini Pro | $27/mo |
| Max (Pro) | Claude Opus, GPT-5, Gemini Ultra | $97/mo |
| Max Fast (Teams) | All models + priority routing | $297/mo |

---

## IP & Legal

- **US Patent #10,290,222** — HACP (Human-AI Connection Protocol)
- **Pending Patent #19/296,986**
- **Trademarks:** SaintSal™, HACP™
- **Company:** Saint Vision Technologies LLC, Huntington Beach, CA

---

## Support

- Email: ryan@hacpglobal.ai
- Web: https://saintsallabs.com
- CEO: Ryan "Cap" Capatosto
