---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

The accent and link tokens meet WCAG AA contrast. In light mode
`--c-on-accent` is dark (accent-950) and `--c-on-accent-subtle` is
accent-800, so text on the accent fill and tint reads at AA; `--c-link-hover`
and `--c-link-subtle-hover` stay in the link family (link-600, link-50)
instead of a pale accent. In dark mode the status and accent tints darken on
hover (`--c-<role>-subtle-hover`), so their ink stays readable.
