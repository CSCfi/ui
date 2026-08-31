---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Retune the dark-mode palette to the approved MyCSC dark theme v2 spec.

- The hand-tuned `slate` ladder now carries the spec's neutral grays: no
  near-black surfaces (page canvas `#24272a`, cards `#2b2f33`), softer
  hairline borders (`#3c4247`), and off-white body text (`#e9ecee` instead
  of pure white). A new `slate-850` step (`#26292d`) backs the inset/muted
  surface tier.
- Dark-mode surface-ladder roles shifted up the retuned ladder so elevation
  reads from progressively lighter surfaces (`surface-sunken` `slate-900` →
  `surface`/`surface-raised` `slate-800` → `surface-overlay` `slate-700`).
- Bright interactive roles (`primary` fills, `link`, `ring`) resolve to
  lightened steps of their own families in dark mode (primary-300/200,
  link-200/100), so re-seeding a family via `applyTheme` re-themes it in
  both modes (ADR-0011, ADR-0034). Deep navy-teal fills (nav chrome, subtle
  fills) stay on primary steps, one step lighter than before.
- Subtle-fill hover states now lighten instead of darken in dark mode
  (`*-subtle-hover`: step 900 → 700).
- The dark-mode logo keeps the magenta kite as a brightened fixed brand
  mark (`#c2447c`) instead of rendering fully white.

All dark-mode text pairs pass WCAG AA (body text 11.4:1, secondary text
≥ 4.75:1 on every surface); non-text UI pairs pass 3:1.
