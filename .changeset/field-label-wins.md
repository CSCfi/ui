---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

A field with a visible `label` is named by it even when the element also has
an `aria-label`, so its accessible name always matches the text on screen (a
voice-control user can say the label). The `aria-label` names only a field
without a `label`.
