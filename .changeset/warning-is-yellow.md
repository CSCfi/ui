---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Warning is yellow (`#ffc400`) instead of orange, so it no longer reads like
error. The `warning` family's ramp changed, and a few warning roles moved to
darker steps to stay at WCAG AA: `--c-on-warning-subtle` in light mode,
`--c-inverse-warning`, and `--c-warning-inverted` in dark mode. The no-results
icon in `c-autocomplete` and `c-tree-select` takes the warning tint's ink.

Yellow is a fill colour: as text or an icon on a light surface it reads 1.6:1.
Where an app colours text or icons with `--c-warning` (or `text-warning`),
switch to `--c-on-warning-subtle` (`text-on-warning-subtle`), which reads
7.2:1 on white and stays legible in dark mode.
