---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Error is a cooler red (`#dd042a`), and in dark mode its fills, outlines and
indicators use a vivid red (`--c-error`, now step 400) instead of salmon.
Error text on a surface uses the new `--c-on-surface-error` token (Tailwind:
`text-on-surface-error`), which stays light enough to read in dark mode. Field
error messages, required marks and other error text use it; an app that
colours its own error text with `--c-error` should switch to it.
