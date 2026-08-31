---
status: accepted
---

# Tooltip and popover: a strict interactivity boundary, and `aria-description` across the shadow gap

`c-tooltip` and `c-popover` join the anchor-positioned overlay family
(ADR-0008) with a hard boundary between them: a tooltip is **never
interactive** (a hover/focus text hint on the inverted tier, ADR-0032), a
popover is **never modal** (a click-opened `role="dialog"` surface with
light dismiss, no focus trap, no auto-focus). And because ARIA ID references
cannot cross a shadow boundary, the tooltip's accessible wiring is a plain
`aria-description` string mirrored onto the slotted trigger — not the
`aria-describedby` the classic tooltip pattern prescribes.

## Context

Both components wrap their trigger in a slot and float a shadow-DOM panel in
the top layer (the ADR-0008 pattern: `popover="manual"`, CSS anchor
positioning, hand-rolled light dismiss). Two questions arose that the
existing ADRs do not answer.

**Where does tooltip end and popover begin?** Component libraries commonly
blur this: tooltips that hold links, popovers that trap focus. Each blurring
breaks an assistive-tech contract — `role="tooltip"` content is announced as
a description and is unreachable by keyboard, so an interactive tooltip is
inaccessible by construction; a focus-trapping popover is a modal wearing
the wrong role.

**How does the tooltip content reach the trigger's accessible description?**
The WAI-ARIA tooltip pattern says `aria-describedby` on the trigger pointing
at the tooltip. Here that is impossible: the trigger is consumer light DOM,
the panel is in the component's shadow root, and ARIA ID references are
tree-scoped. ARIA element reflection (`ariaDescribedByElements`) does not
help either — its scoping rules forbid an outer-tree element from
referencing shadow content (an encapsulation leak).

## Decisions

- **The interactivity boundary is a contract, not a default.** `c-tooltip`
  ships no click trigger, no focusable content support, and documents the
  `content` slot as non-interactive; `c-popover` ships no focus trap, no
  auto-focus, and no `persistent` mode. Needs beyond the boundary route to
  the neighbouring component (`c-popover` for interactive floating content,
  `c-modal` for blocking flows) instead of growing options here.
- **Tooltip a11y = `aria-description` mirrored onto the trigger.** The
  component keeps the trigger's description in sync from the `text` prop or
  the `content` slot's flattened text, via `slotchange`/watch. The panel
  keeps `role="tooltip"` for semantics, but assistive tech reads the
  description from the trigger — which also works while the bubble is
  closed, matching how `aria-describedby` tooltips behave.
- **Popover naming = `heading` prop or host `aria-label`,** mirrored onto
  the shadow panel (the c-modal precedent, with the same console warning
  when absent) — `aria-labelledby` cannot reach slotted content either. The
  prop is `heading`, not `title`: a `title` attribute on the host triggers
  the browser's native tooltip and collides with `HTMLElement.title` in
  every typed consumer.

## Considered options

For the tooltip description:

- **A light-DOM describer node** appended to the host (so `aria-describedby`
  could target it): works, but the component would mutate the consumer's DOM
  and duplicate the content. Rejected.
- **Cloned visually-hidden text inside the trigger**: same duplication, plus
  it breaks when the trigger element manages its own content. Rejected.
- **Skip the wiring and rely on the visible bubble**: screen readers would
  get nothing — the bubble is not a live region. Rejected.

## Consequences

- `aria-description` is a string, so a formatted `content` slot flattens to
  text for assistive tech; consumers needing richer accessible structure
  should use `c-popover`.
- The description is present on the trigger even while the tooltip is
  closed. This is intended (it matches `aria-describedby` semantics), but it
  means `text` must be a description, not essential visible-only content.
- A future request to "allow a link in the tooltip" or "keep the popover
  open until confirmed" is a request to cross the boundary — the answer is
  the neighbouring component, not a prop.
