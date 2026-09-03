---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-csc-logo` renders fully white in dark mode. The dark `logo-wordmark`,
`logo-teal` and `logo-magenta` roles all resolve to `white`; previously the
star and wordmark were near-white (`slate-100`) and the kite kept a
brightened magenta literal, so the mark read as two-tone on the dark header.
Light mode is unchanged.
