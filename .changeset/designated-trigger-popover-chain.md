---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Add designated triggers and popover nesting (ADR-0038).

- `c-popover`, `c-menu` and `c-tooltip` accept a new `trigger` prop — the
  document ID of an element, or the element itself — for opening the overlay
  from a trigger that cannot be slotted. The component wires its usual
  opening interaction (click, or hover/focus for the tooltip), ARIA mirroring
  and focus return onto the designated element and anchors the panel to it.
  When both the slot and the prop are supplied, the prop wins and a console
  warning flags it.
- `c-popover`s now nest: the open popovers form a chain where Escape closes
  only the innermost popover (one press per layer), clicking outside closes
  every popover that does not contain the click, and closing a popover closes
  everything nested inside it. Previously a single Escape press closed every
  open popover at once.
