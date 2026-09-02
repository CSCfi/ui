---
status: accepted
---

# Designated triggers on the overlay family, and the popover chain for nested `c-popover`s

Two related extensions to the anchored overlay components. First, a **trigger**
no longer has to be slotted: every overlay component with a `trigger` slot
(`c-popover`, `c-menu`, `c-tooltip`) also accepts a `trigger` prop — a document
ID or an element reference — designating an element elsewhere in the document
as its trigger, with identical behavior on both supply routes. Second, nested
`c-popover`s are coordinated by a shared **popover chain** controller
(CONTEXT.md): Escape peels the innermost popover one press at a time, and light
dismiss closes exactly the popovers that do not *logically* contain the pointer
event.

## Context

Consumers need (1) to open a popover from a trigger that cannot be slotted —
a button living elsewhere in the layout — and (2) popovers whose panel content
opens further popovers (a surface within a surface: a help note or picker
inside a settings panel).

The `open` prop already opened a popover programmatically, but a non-slotted
opener got nothing else: the panel stayed anchored to the empty trigger-slot
wrapper, no ARIA mirroring, no focus return, and pointerdown on the opener
light-dismissed the panel it was trying to toggle.

Nesting had two latent breaks. Escape closed *every* open popover at once:
each popover listens with a capture-phase `document` keydown listener, and
`preventDefault()` only signals the bubble-phase modal-stack handler — capture
listeners cannot see each other's claim. And light dismiss used pure DOM
containment (`composedPath().includes(host)`), which works when the inner
popover's host is slotted inside the outer panel but breaks the moment
designated triggers decouple a popover's host from where its trigger sits.

## Decisions worth recording

- **One Trigger concept, two supply routes.** The `trigger` prop is not a
  second kind of trigger: the component wires its usual opening interaction
  (click for `c-popover`/`c-menu`, hover/focus for `c-tooltip`), mirrors the
  ARIA attributes, returns focus on Escape, and exempts the element from light
  dismiss — exactly as for a slotted trigger. When both routes are supplied,
  the prop wins and the component warns in the console (explicit designation
  beats implicit projection). *Rejected:* consumer-wired toggling (the two
  routes would differ in the most basic behavior), and the name "external
  trigger" (**external** is ADR-0029's consumer-owned data-operation mode).
- **The prop accepts an ID string or an element reference.** An ID works from
  plain HTML attributes; an element reference works via property binding
  (Vue, the ADR-0019 React wrapper) and survives shadow boundaries and ID
  collisions. *Rejected:* selector strings (stringly-typed, silent failures).
- **Designated triggers are positioned by measurement onto a proxy anchor,
  not by CSS anchor names.** Anchor names are tree-scoped (the ADR-0008
  constraint): the shadow-DOM panel cannot reference an `anchor-name` on an
  outer-tree element. Instead the component measures the designated trigger
  (`getBoundingClientRect`, re-measured on scroll/resize) and pins its own
  in-shadow anchor wrapper over that rect — so `position-area` placement and
  the `position-try-fallbacks` flip/shift keep working unchanged; only the
  measurement is JS.
- **Nested popovers form a popover chain, coordinated by a shared module.**
  Like `modalStack.ts`, a module-level controller owns the ordered set of open
  popovers. A popover whose trigger sits inside an open popover's panel
  *joins* the chain; one whose trigger is elsewhere *replaces* it — siblings
  never coexist. Escape closes only the innermost member per press (the
  library-wide "peel innermost-first" convention); an Escape that peeled a
  popover never reaches an enclosing popover or modal. *Rejected:*
  `popover="auto"` native stacking — auto popovers across separate shadow
  roots dismiss each other, the same constraint that forced `popover="manual"`
  in ADR-0008.
- **Dismissal containment is logical, not DOM ancestry.** A popover's inside
  is its host subtree, its panel, its designated trigger, and the insides of
  its open descendants in the chain. This is what keeps an outer popover open
  while the user clicks inside an inner popover whose *host* lives elsewhere
  in the document — DOM-only containment cannot express that once designated
  triggers exist.

## Consequences

- Closing any chain member (including programmatically via `open`) closes its
  descendants — no orphaned floating panels.
- Chain members below the innermost stay interactive; nothing goes inert.
  The chain is deliberately not the modal stack (CONTEXT.md distinguishes the
  terms).
- `c-tooltip` manages hover/focus listener lifecycles on elements it does not
  own; all three components must detach cleanly when the prop changes or the
  host disconnects.
- The manifest/React wrapper expose the prop as `string | HTMLElement`.
