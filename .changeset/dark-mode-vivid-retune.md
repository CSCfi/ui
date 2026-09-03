---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Make dark mode more vibrant: saturated fills and visible subtle tints, all
still resolved inside each role's own family (ADR-0034).

- The ramp core (`src/theme/ramp.js`) now holds full seed chroma through
  steps 400–300 and tapers only from 200 up (`C_FACTOR` 400/300/200:
  0.92/0.78/0.55 → 1.0/1.0/0.72). Step 300 is every family's dark-mode fill
  and 200 its hover, and the old taper left low-chroma seeds reading grey —
  the dark primary button moves from `#67a2b0` to `#54a5b7` at the same
  contrast. Every family's 200–400 steps shift accordingly in both modes
  (light-mode hover fills get slightly richer); warning and error are at the
  sRGB gamut edge and do not move. Consumer ramps from `applyTheme` /
  `themeToCss` follow the same curve.
- Dark-mode status and accent fills move to the saturated `*-400` step
  (hover `*-300`, ink `*-950`). Primary, secondary and link fills stay where
  they are — their next step fails WCAG AA text with any ink.
- Dark-mode subtle tints move from `*-800` to `*-700` (hover `*-600`) for
  primary, secondary, info, error and link; `*-800` sat within 1.0–1.6:1 of
  the slate-800 page and read as the page colour. Accent, success and
  warning stay on `*-800` (hover `*-700`) so their coloured `*-200`
  `on-*-subtle` ink keeps AA — that ink is also what alerts paint their icon
  and heading with, so it stays coloured rather than near-white.
- Dark nav chrome moves one step lighter (`primary-700`, hover `primary-600`)
  and the active item becomes the brand `primary-500` under white ink.
- The frozen chart slots (ADR-0030) are literals and do not move.

Dark mode passes every audited text pair at AA and every non-text pair at
3:1 (`scripts/audit-contrast.mjs --strict`); ramp parity
(`scripts/check-ramp-parity.mjs`) holds.
