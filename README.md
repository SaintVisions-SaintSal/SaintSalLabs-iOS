# SaintSal™ Labs — iOS App
## US Patent #10,290,222 · HACP Protocol · Saint Vision Technologies LLC

Production React Native (Expo) iOS app for saintsallabs.com

---

## STACK
- **React Native** via Expo SDK 51
- **Expo Router** v3 (file-based navigation)
- **API Gateway** — Express on Render (`SaintSalLabs-API`)
- **Streaming** — XHR-based SSE (works in Hermes/React Native)
- **Auth** — x-sal-key header (`sal-live-2026`)

---

## SCREENS
| Tab | Screen | Description |
|-----|--------|-------------|
| 💬 Chat | ChatScreen | 12 verticals · streaming · landing prompts |
| ⚡ Builder | BuilderScreen | Code · Social · Images · Video · Deploy |
| 🔍 Search | SearchScreen | Gemini + Google Search grounding |
| 📊 Dashboard | DashboardScreen | Stats · pricing · API health · links |
| ⚙️ Settings | SettingsScreen | Model selector · preferences · API config |

---

## SETUP

```bash
# 1. Install deps
npm install

# 2. Start dev server
npx expo start

# 3. Press 'i' for iOS Simulator
```

---

## API GATEWAY (server.js)

Deploy to Render: https://render.com

```bash
# Endpoints
POST /api/chat/anthropic  → Claude SSE streaming
POST /api/chat/xai        → Grok SSE streaming
POST /api/chat/openai     → GPT JSON (social generation)
POST /api/builder         → SAL Builder SSE (Claude + builder system)
POST /api/search/gemini   → Gemini + Google grounding
GET  /health              → Status check

# All endpoints require:
x-sal-key: sal-live-2026
```

### Render Environment Variables
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
GEMINI_API_KEY_FALLBACK=AIza...
XAI_API_KEY=xai-...
API_SECRET=sal-live-2026
```

---

## BUILD FOR APP STORE

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build production
eas build --profile production --platform ios

# Submit to App Store
eas submit --platform ios
```

---

## FILE STRUCTURE
```
SaintSalLabs/
├── app/
│   ├── _layout.js          # Root layout
│   └── (tabs)/
│       ├── _layout.js      # Tab bar config
│       ├── index.js        → ChatScreen
│       ├── builder.js      → BuilderScreen
│       ├── search.js       → SearchScreen
│       ├── dashboard.js    → DashboardScreen
│       └── settings.js     → SettingsScreen
├── src/
│   ├── screens/            # Full screen implementations
│   ├── components/         # Shared UI components
│   ├── lib/api.js          # XHR streaming API client
│   └── config/theme.js     # Design system + verticals
├── server.js               # API Gateway (deploy to Render)
├── app.json                # Expo + iOS config
└── eas.json                # App Store build config
```

---

## DESIGN SYSTEM
| Token | Value |
|-------|-------|
| Background | `#0C0C0F` |
| Amber accent | `#F59E0B` |
| Text | `#E8E6E1` |
| Sidebar | `#090910` |

---

© 2026 Saint Vision Technologies LLC · Patent #10,290,222
