# /review — Code Review (iOS)

Review iOS screen code before Metro compile gate and EAS build.

## Steps

1. `git diff main` — list changed files
2. For each changed file check:
   - All imports declared (missing imports = crash)
   - No `fetch` for streaming — XHR only
   - No direct AI provider calls — gateway only
   - `StyleSheet.create()` used — no inline styles
   - `SafeAreaView` wraps all screens
   - `useSafeAreaInsets()` used for dynamic safe areas
   - No `console.log` in production paths
   - `AuthKey_*.p8` not staged
3. Run Metro compile check:
   ```bash
   npx expo export --platform ios --output-dir /tmp/review-export
   ```
   Report module count and any errors.

## Output
```
REVIEW: SaintSalLabs-iOS Build #XX
Files changed: X
Missing imports: X (BLOCKS BUILD if > 0)
Hermes violations (fetch streaming): X (BLOCKS BUILD if > 0)
Direct AI calls: X (BLOCKS BUILD if > 0)
Metro compile: X modules, X errors

VERDICT: APPROVED | BLOCKED
```
