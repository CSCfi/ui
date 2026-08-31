---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Add two new anchor-positioned overlay components:

- `c-tooltip` — a non-interactive text hint shown on hover or keyboard focus
  of its slotted trigger, on the inverted surface tier. Content via the
  `text` prop or the `content` slot; WCAG 1.4.13 behaviour (hoverable panel,
  Escape dismiss, configurable show `delay`).
- `c-popover` — a click-opened, non-modal interactive surface anchored to its
  slotted trigger, with light dismiss and Escape. Optional `heading`; body
  via the default slot.

Both float in the top layer via the native Popover API + CSS anchor
positioning (no z-index management needed), support `position` (12
placements, new shared `CPlacement` type), `distance`, and a controlled
`open` prop with a `change:open` event, and are customizable via
`::part(trigger)` / `::part(panel)` (+ `::part(heading)` on the popover) and
the semantic tokens.

Also fixes `c-alert` mirroring its live-region `role` onto the shadow root
element (duplicate role for assistive tech).
