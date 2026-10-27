---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-tabs` follows the WAI-ARIA tabs pattern:

- The row of tabs is the `tablist`; the scroll arrows and the panels are no
  longer inside it. An `aria-label` on `c-tabs` names it, and the vertical
  layout marks it `aria-orientation="vertical"`.
- With `c-tab-buttons`, its buttons are the tabs (`aria-selected`), not toggle
  buttons.
- The arrow keys act on key press and skip disabled tabs, Up and Down work in
  the vertical layout, and Home and End go to the first and last tab. Moving
  focus still selects nothing until Enter or Space.
- A disabled tab is announced as disabled instead of being hidden.
- With no tab matching `value`, the first enabled tab is the Tab stop.
- Moving focus to a tab out of view no longer waits for the row's scroll
  animation (it never moved under reduced motion), and the tab set no longer
  pulls focus back to the active tab when it re-measures.
