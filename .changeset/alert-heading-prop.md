---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

c-alert heading API:

- New `heading` string prop renders the alert heading; the slot overrides
  it for rich content. New `heading` CSS part on the prop-rendered heading.
- The `title` slot is renamed to `heading` (`slot="heading"`) — `title` is
  avoided across the library because the native `title` attribute triggers
  the browser tooltip.
