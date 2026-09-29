# 57. Components honour the OS reduced-motion preference by default

Date: 2026-09-25

## Status

Accepted

## Context

Only three components looked at `prefers-reduced-motion`: `c-modal` skipped its
open and close keyframes, `c-tabs` skipped its indicator slide, and `c-toast`
swapped its slide for a fade. Every other transition and keyframe in the
library ignored it: the accordion collapse, chevron turns, the field panels'
drop-in, the side navigation drawer, button ripples and the tab strip's smooth
scroll. Consumers had to write their own overrides, and `::part()` can only
reach the parts, not the internal nodes that carry most of the motion.

## Decision

- **One rule in the shared utility sheet.** Under `reduce`, `:host`, `*`,
  `::before` and `::after` get `transition-duration: 0s` and
  `transition-delay: 0s`, both `!important`. The sheet is adopted by every
  shadow root, so this covers utilities and escape-hatch CSS without touching
  each component, and new components are covered automatically.
- **Zero, not near-zero.** A 0.01ms duration looks safer because it still fires
  `transitionend`. It is not safe: `transition-property` defaults to `all`, so
  a non-zero duration on every element turns every property write into a
  transition. The dropdown's positioning code then read the pre-write box and
  opened the list downward off-screen.
- **Components that await `transitionend` restore their own duration.**
  `c-tabs` keeps its scroll and indicator elements at 0.001ms, the speed it
  already used with motion off. `c-toast` keeps its 0.2s host cross-fade. Both
  use `!important` in their own sheet, which is adopted after the shared one.
- **Keyframes are decided per component.** Decorative ones stop in the
  component's own `@media` block: the dropdown, autocomplete and tree-select
  panels open in place, and the loader message fades without rising. Activity
  indicators keep running, because for a spinner or an indeterminate bar the
  motion is the message.
- **Scripted motion reads one helper.** `prefersReducedMotion()` in
  `src/shared/reducedMotion.ts` is read when the motion runs, not once at
  mount. The ripple spawns nothing, the scroll strip scrolls instantly, and
  `c-modal` and `c-tabs` use the helper instead of their own `matchMedia`
  calls.

## Consequences

- Specs run under `reduce` (the Playwright context default). A spec that
  asserts motion itself wraps the assertions in the harness's `withMotion()`,
  which switches the preference through a browser command and restores it.
- A consumer who wants motion regardless of the OS setting has no switch for
  it. That is deliberate: the preference belongs to the user.
