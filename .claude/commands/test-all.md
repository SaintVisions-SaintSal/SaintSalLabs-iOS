# /test-all — Full Test Suite (iOS)

Run all tests before any EAS build. This is the Metro compile gate + API connectivity check.

## Steps

```bash
# 1. Metro compile gate
npx expo export --platform ios --output-dir /tmp/test-export
# Expected: XXXX modules, 0 errors
# If errors exist — STOP, fix before proceeding

# 2. API gateway reachability
curl -s -w "\nHTTP: %{http_code}" --max-time 10 \
  https://www.saintsallabs.com/api/health

# 3. AI chat endpoint (what the app calls)
curl -s -w "\nHTTP: %{http_code}" -X POST \
  https://www.saintsallabs.com/api/chat \
  -H "Content-Type: application/json" \
  -H "x-sal-key: saintvision_gateway_2025" \
  -d '{"messages":[{"role":"user","content":"ping"}],"model":"claude"}'

# 4. Import audit — check for missing imports in changed files
grep -n "Image\|WebView\|useEffect\|useState" [changed-file] | head -20
# Verify each is imported at top of file

# 5. Hermes compliance check — no fetch streaming
grep -rn "new EventSource\|ReadableStream\|\.body\.getReader" app/ src/
# Expected: no matches
```

## Pass Criteria
- Metro: 0 errors
- `/api/health` → HTTP 200
- `/api/chat` → HTTP 200 + response
- No EventSource/ReadableStream usage
- All used components imported
