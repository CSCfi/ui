---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

The dark-mode hover tint is subtle again. `primary-subtle-hover` mapped to
primary-600 in dark mode — brighter than the primary-700 fill of the selected
state — so a hovered tab, list row or table row outshone the selected one. It
now maps to primary-800, a step fainter than the fill, as in light mode where
primary-50 sits under the primary-100 fill.
