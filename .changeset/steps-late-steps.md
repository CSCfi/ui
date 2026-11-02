---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-steps` keeps its connecting lines in step with its `c-step` elements: a step
added after the indicator mounts gets its line, a removed step takes its line
with it, and setting `value` after adding a step no longer throws.
