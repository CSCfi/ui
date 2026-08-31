# 31. Self-rendering c-radio, group-coordinated in JS

Date: 2026-08-28

## Status

Accepted

Amends ADR-0022 (2026-08-28): the named `slot="label"`, rejected there as a
third labeling pattern, is sanctioned narrowly — as the label fallback for a
group-labeled component whose default slot is the children's home (currently
`c-radio-group` only; the `label` prop stays primary). The objection has
weakened since: this change deletes the filtered default slot that was one of
the patterns it counted.

## Context

`c-radio` was a data-only carrier: `c-radio-group` scanned its *direct*
light-DOM children (`:scope > c-radio`), scraped `value`/`disabled`
attributes and `textContent`, and rendered every radio row inside its own
shadow root. Three consequences had become untenable:

- A `<c-radio>` wrapped in any layout element rendered nothing, so consumer
  layouts (bordered option cards, grids) were impossible. Making the scan
  depth-agnostic would not have helped: the rendered rows live in the
  *group's* shadow root, where consumer wrappers can never wrap them.
- The scrape read attributes, but frameworks set DOM properties — the React
  wrapper (and Vue itself for declared props on upgraded elements) left the
  attributes absent, silently yielding empty values.
- `textContent` scraping flattened any rich label markup to text.

## Decision

**`c-radio` renders itself**: a shadow `<label>` wrapping a visually-hidden
native `<input type="radio">`, the ring/dot indicator, and the default slot
as the clickable, announced label content. Radios may sit at any depth
inside the group's default slot.

**The group becomes a coordinator.** Native radio `name` grouping cannot
cross shadow roots, so grouping is JS:

- *Discovery*: `host.querySelectorAll('c-radio')` filtered by
  `closest('c-radio-group') === host`, plus a MutationObserver
  (childList/subtree + `value`/`disabled` attribute filter).
- *Down*: `syncRadios()` writes `checked`, combined disabled, and the roving
  `tabIndex` imperatively into each radio's shadow input, reading
  `value`/`disabled` as DOM properties. Recolouring (error/disabled) rides
  the inherited `--_c-radio-color` custom property.
- *Up*: the radio re-dispatches its input's native `change` as a composed
  bubbling `change` (detail: its value) via the event map; the group catches
  it on its host and emits the model triple. Native `change` fires only on
  user interaction, so "emit only on interaction" holds structurally — the
  group never emits from a DOM scan.
- *Keyboard*: the WAI-ARIA radio pattern, group-implemented — roving
  tabindex, arrows wrap + select (via the target input's programmatic
  `click()`, reusing the up-flow path), disabled skipped, Space native,
  Enter no longer intercepted.

**API cuts** (selection has exactly one source of truth, the group's
`value`): `items`, `returnObject`, and `hostId` dropped from the group;
`checked` dropped from `c-radio`; values are strings, matched strictly.

## Alternatives considered

- **Depth-agnostic parent scrape** (à la `c-select`'s `c-option` handling):
  rejected — fixes the wrapped-child *discovery* but the rendered rows still
  live in the group's shadow root, so consumer layout wrappers remain
  impossible, and the scrape/property hazards persist.
- **Light-DOM rendering**: rejected per ADR-0005.
- **Child self-registration events** (mount/unmount protocol instead of the
  scrape): rejected — adds a registration protocol and document-order
  sorting for no gain over the observer-backed scrape.
- **Native `<fieldset>`/`<legend>` group wrapper**: rejected — ADR-0022's
  group-label anatomy (`role="radiogroup"` + `aria-labelledby` + the shared
  label SFC) stays; a fieldset would fork the shared anatomy for one
  component and bring default styling to undo.

## Consequences

- `c-radio` gains a public rendering contract: parts (`root`, `indicator`,
  `content`), a `change` event, and a pre-upgrade geometry reservation
  (42px) — it joins the resting-geometry exception set.
- The discovery scrape means a `c-radio-group` cannot be composed inside
  another component's shadow root (the reason `c-button-group` uses
  `assignedElements`); no such composition exists or is planned.
- The shared `FieldMessage.vue` extracted here (reserved-height hint/error
  line) should eventually replace the hand-rolled copies in `c-input` and
  `c-checkbox` and the `c-message` element used by `c-otp-input` — follow-up
  refits, deliberately out of this change's blast radius.
- Duplicate radio `value`s all show checked; that is a consumer error, not a
  supported state.
- The modal focus-trap targets `c-radio` (not `c-radio-group`), whose shadow
  root now holds the native focusable.
