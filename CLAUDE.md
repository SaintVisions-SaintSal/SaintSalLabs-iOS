# SaintSal Labs — iOS App (SaintSalLabs-iOS)

> SaintVision Technologies LLC | CEO: Ryan "Cap" Capatosto | Patent #10,290,222 (HACP)  
> Stack: Expo (React Native) · Expo Router · EAS Build · TestFlight · Hermes engine

---

## 1. Tech Stack & Architecture

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK (React Native) |
| Router | Expo Router (file-based, like Next.js) |
| JS Engine | Hermes (no EventSource, no ReadableStream, no fetch streaming) |
| State | React hooks (useState, useEffect, useContext) |
| Auth | Supabase Auth via `src/lib/supabase.js` + `AuthContext.js` |
| AI | Via API Gateway ONLY — never direct provider calls |
| Build | EAS Build → TestFlight → App Store |
| Bundle ID | `com.saintvision.saintsallabs` |
| EAS Project | `af0fb455-43bc-4de1-a3e0-52db3e394651` |
| GitHub | `SaintVisions-SaintSal/SaintSalLabs-iOS` |

### Design System (non-negotiable)
```javascript
const GOLD    = '#D4AF37';              // Primary accent — always use this
const BG      = '#0A0A0A';             // Screen background
const CARD_BG = '#141416';             // Card / surface background
// Text: white 'rgba(255,255,255,0.9)' | muted 'rgba(255,255,255,0.4)'
// Border: 'rgba(212,175,55,0.15)'
```

### App Structure
```
app/
├── (auth)/         — Login, signup, email verify, splash, business DNA
├── (stack)/        — 80+ stack screens (all vertical screens)
├── (tabs)/         — 5 bottom tabs: Search | Builder | SAL | Social | More
└── +not-found.js   — Catch-all → redirects to (tabs)
src/
├── screens/        — 85 screen components
├── hooks/          — useAgentPipeline (builder SSE)
├── lib/            — api.js (ALL networking), supabase.js, AuthContext.js
├── components/     — MarkdownText, ScreenHeader, shared UI
└── config/         — theme.js
assets/             — logo-80.png, splash, icons
```

---

## 2. Critical Rules — Read Before Every Build

### SSE Streaming (Hermes ONLY — non-negotiable)
Hermes does NOT support `EventSource`, `ReadableStream`, or `fetch` streaming.  
ALL streaming must use XHR:

```javascript
const xhr = new XMLHttpRequest();
xhr.open('POST', url);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.setRequestHeader('Accept', 'text/event-stream');
xhr.timeout = 300000; // 5 min

let lastIndex = 0;
let eventBuffer = '';

xhr.onprogress = () => {
  const newData = xhr.responseText.slice(lastIndex);
  lastIndex = xhr.responseText.length;
  eventBuffer += newData;
  const parts = eventBuffer.split('\n\n');
  eventBuffer = parts.pop() || '';
  for (const raw of parts) {
    const dataMatch = raw.match(/^data:\s*(.+)$/m);
    if (!dataMatch) continue;
    try {
      const d = JSON.parse(dataMatch[1].trim());
      // handle d.type === 'chunk' | 'done' | 'error'
    } catch {}
  }
};
xhr.send(JSON.stringify(payload));
```

### API Gateway Rule (absolute)
- NEVER call Anthropic, OpenAI, xAI, Gemini directly from the iOS client
- ALL AI → `POST https://www.saintsallabs.com/api/chat` or `/api/mcp/chat`
- Auth header: `x-sal-key: saintvision_gateway_2025`
- Use `src/lib/api.js` — never create new fetch calls inline in screens

### Import Checklist (most common crash cause)
Every screen must import what it uses:
```javascript
// React Native components
import { View, Text, ScrollView, TouchableOpacity, StyleSheet,
         SafeAreaView, Image, FlatList, ActivityIndicator } from 'react-native';
// React hooks
import React, { useState, useEffect, useCallback, useRef } from 'react';
// Third party — must be installed first
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
```

### Navigation Patterns
```javascript
import { router } from 'expo-router';

// Switch tab:
router.navigate({ pathname: '/(tabs)', params: { vertical: 'search' } });
// Push stack screen:
router.push('/(stack)/screen-name');
// Go back:
router.back();
```

---

## 3. Testing Requirements (Metro Compile Gate)

**NO build ships without passing Metro compile check:**

```bash
npx expo export --platform ios --output-dir /tmp/buildXX-export
# Expected: XXXX modules, 0 errors
# If module count changes significantly, investigate before proceeding
```

---

## 4. Git Workflow & EAS Build Sequence

```bash
# 1. Pull latest
git pull origin main

# 2. Compile gate (REQUIRED)
npx expo export --platform ios --output-dir /tmp/build-export

# 3. Commit (planned files only)
git add [planned files only]
git commit -m "Build #XX — [description]"
git push origin main

# 4. EAS Build + Auto-submit to TestFlight
EXPO_TOKEN=t3E9VM-EvXJbj0yKn8o8sogbCBa1wk7V9oXuoSSq \
npx eas-cli build --platform ios --profile production \
--auto-submit --non-interactive
```

- **Commit format:** `Build #XX — [description]`
- **Never force push main**
- **Current build number:** 95+ (auto-increments via EAS)

---

## 5. Security & Compliance

- **`.env.local` is gitignored** — Supabase, Stripe keys stay there
- **`.claude/settings.local.json` is gitignored**
- **`AuthKey_*.p8` is gitignored** — Apple auth private key, NEVER commit
- **`*.mobileprovision` is gitignored** — provisioning profiles
- **PreCommit hook** — blocks API key commits
- **No direct AI provider calls from client** — gateway only
- **EXPO_TOKEN** — never commit, set in environment only

---

## 6. Screen Template (Standard)

```javascript
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GOLD = '#D4AF37';
const BG = '#0A0A0A';
const CARD_BG = '#141416';

export default function MyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Image
          source={require('../../../assets/logo-80.png')}
          style={{ width: 28, height: 28, borderRadius: 14 }}
        />
        <Text style={s.title}>Screen Title</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#fff', marginLeft: 10 },
});
```

---

## Anti-Patterns — Never Do These

- Use `fetch` for streaming (Hermes crash) — use XHR only
- Call AI providers directly from client — gateway only
- Miss an import — leads to undefined component crashes
- Push without Metro compile gate passing
- Commit `AuthKey_*.p8` or `settings.local.json`
- Add new screens without registering in the correct router group
- Use inline styles instead of `StyleSheet.create()`
