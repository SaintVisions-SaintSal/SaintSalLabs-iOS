# /deploy — EAS Build + TestFlight (iOS)

Full ship sequence for iOS. Never skip the Metro compile gate.

## Steps

```bash
# 1. Metro compile gate — REQUIRED, no exceptions
npx expo export --platform ios --output-dir /tmp/build-export
# Expected: XXXX modules, 0 errors

# 2. Commit (planned files only — never stage AuthKey or .env.local)
git add [planned files only]
git commit -m "Build #XX — [description]"
git push origin main

# 3. EAS Build + Auto-submit to TestFlight
EXPO_TOKEN=t3E9VM-EvXJbj0yKn8o8sogbCBa1wk7V9oXuoSSq \
npx eas-cli build --platform ios --profile production \
--auto-submit --non-interactive

# 4. Monitor EAS dashboard
# https://expo.dev/accounts/saintvision/projects/SaintSalLabs-iOS/builds
```

## EAS Config Reference
- Bundle ID: `com.saintvision.saintsallabs`
- EAS Project ID: `af0fb455-43bc-4de1-a3e0-52db3e394651`
- Profile: `production`
- Auto-submit: Yes (TestFlight)

## Success Criteria
- Metro: 0 errors, module count unchanged or explained
- EAS build ID returned
- TestFlight submission ID returned
- Build visible in App Store Connect within 15 min
