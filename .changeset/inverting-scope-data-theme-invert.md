---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Invert the theme mode for part of a page. An element carrying
`data-theme-invert` resolves the semantic tokens in the opposite mode to the one
it sits in — dark inside a light page, light inside a dark one — so a region
that must always stand apart from its surroundings needs no per-page variant.
Inverting scopes nest like pinned ones, so inverting twice is back in the
surrounding mode, and a `data-theme` on the same element wins over the
inversion. On `<html>` it means the opposite of the OS preference. The attribute
is presence-only, like `hidden`: `data-theme-invert="false"` still inverts, so
remove it to stop.

`data-theme` is unchanged and still takes only `light` and `dark`, so a
`data-theme` your own theming system already sets still cannot pull components
out of the surrounding mode.

Every mode block now publishes the mode it resolved as `--c-mode` (`light` or
`dark`). It is public: read it in JS, or style-query it from your own CSS with
`@container style(--c-mode: dark) { … }` instead of duplicating the `data-theme`
selectors.

`themeMode(element)` now reads that property instead of walking up for a
`data-theme` attribute, so it always gives the same answer as the CSS — and it
now works for an element **inside a shadow root**, where the old ancestor walk
stopped at the boundary and fell back to the OS preference.
`observeThemeMode()` follows `data-theme-invert` too.

A hand-written role override needs the new scope as well:
`:root, [data-theme], [data-theme-invert] { --c-surface: … }`. Seed overrides
via `applyTheme` are unaffected.
