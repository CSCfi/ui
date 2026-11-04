---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Warning is yellow (`#ffc400`) instead of orange, so it no longer reads like
error. The `warning` family's ramp changed, and a few warning roles moved to
darker steps to stay at WCAG AA: `--c-on-warning-subtle` in light mode,
`--c-inverse-warning`, and `--c-warning-inverted` in dark mode. The no-results
icon in `c-autocomplete` and `c-tree-select` takes the warning tint's ink.
