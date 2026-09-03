---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Export `DEFAULT_SEEDS` and `FAMILIES` from the package root.

A theme UI (colour pickers, a brand switcher) can now start from the
library's built-in step-500 seeds and the list of themable families instead
of reading `--c-<family>-500` back off the document — those values are
`oklch()` strings since ADR-0041 and are not what an `<input type="color">`
accepts. `applyTheme` / `resetTheme` are unchanged.

The published typings now include the hand-written `ramp.d.ts`, so `Family`,
`ThemeSeeds`, `DEFAULT_SEEDS` and `FAMILIES` resolve to their real types for
consumers instead of falling through to an unresolved module.
