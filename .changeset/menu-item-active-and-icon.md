---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Add selectable-choice support and leading icons to c-menu-item:

- New `active` prop marks an item as the currently selected choice: it
  renders a trailing indicator icon (a check mark by default) and stamps
  `role="menuitemradio"` + `aria-checked`. The state is consumer-owned — the
  menu still emits `select` and never toggles it. Leave `active` unset for
  regular command items (tri-state like c-button's `active`).
- New `activeIcon` prop overrides the indicator's SVG path.
- New `icon` prop renders a leading icon (SVG path data) before the item's
  content, following the row color through hover/highlight/danger/disabled
  states.
- New `icon` and `check` CSS parts for customization.
- Fix: c-menu's `distance` prop (documented but previously inert) now works —
  it offsets the panel from the trigger on the placement's axis (surviving
  the flip fallbacks) and is inherited by every submenu, which leaves the
  identical gap from its parent surface instead of overlapping it. Default
  stays `0`: surfaces touch, no gap.
