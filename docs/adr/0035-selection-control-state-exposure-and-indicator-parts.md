---
status: accepted
---

# Selection controls expose custom states via `:state()`; `indicator`/`mark` parts name the visual control

Consumers could not restyle the indicators of `c-checkbox` and `c-radio` —
the single most-asked customization ("checked checkboxes in this form are
green") was unwritable. We fix it with two coupled changes across the
selection controls (`c-checkbox`, `c-radio`, `c-switch`): the host
republishes its otherwise-invisible interaction state as **ElementInternals
custom states**, selectable from consumer CSS with `:state(...)`; and the
`indicator` part is **re-stamped onto the actual visual control** (the
checkbox box, the radio ring), with the checkbox glyph gaining a `mark`
part. The consumer contract becomes:

```css
c-checkbox:state(checked)::part(indicator) { background: green; }
c-checkbox:state(checked)::part(mark) { color: white; }
c-radio:state(checked)::part(indicator) { color: green; }  /* ring + dot */
c-switch:state(checked)::part(slider) { background: green; }
```

## Context

Two structural gaps made the indicators unstylable:

1. **`part="indicator"` named the wrong element.** In both components it was
   stamped on the 42px circular ripple/hover surface, while the thing anyone
   means by "indicator" — box, checkmark, ring, dot — was a `::before`
   pseudo-element, a part-less SVG, or a part-less span. `::part()` cannot
   select descendants, so the radio's ring and dot were unreachable
   entirely. This also contradicted the glossary, which defines the ripple
   as purely internal, carrying no part.
2. **State never crossed the shadow boundary.** Checked/indeterminate lives
   on a hidden inner `<input>`; nothing on the host distinguished a checked
   control from an unchecked one, so no per-state selector could exist, no
   matter which parts did.

ADR-0006 makes the part set the customization contract, so both fixes are
contract changes — made now, at `4.0.0-alpha.5`, while breaking is cheap.

## Decisions worth recording

- **Custom states via `ElementInternals.states`** (`useHostStates` shared
  composable owns the single `attachInternals()` call; silent no-op where
  unavailable). `:state()` is Baseline 2024 — older than the CSS anchor
  positioning ADR-0008 already requires, so it sets no new browser floor in
  practice. States are not a second customization API: they restyle nothing
  by themselves; they are selector hooks that `::part()` rules key on.
- **The state vocabulary is curated public API, like parts**, documented
  with a `@cssstate` docblock tag (analyzer: manifest `cssStates` field +
  script↔tag symmetry lint). Exposed: `checked` + `indeterminate`
  (`c-checkbox`), `checked` + `disabled` (`c-radio` — both group-driven and
  otherwise invisible on the host), `checked` (`c-switch`). Consumer-set
  props (`valid`, a standalone `disabled`) are deliberately NOT mirrored —
  the consumer already owns a selector for what they set themselves.
- **`indicator` means the visual control.** The checkbox box became a real
  element to carry the part (it was a `::before`); the radio ring span
  carries it, with the dot as its `::after`. The ripple surface **loses its
  part**, restoring the glossary's "ripple is internal" rule. `c-switch`
  keeps its `slider` part unchanged — state exposure alone makes it
  per-state stylable.
- **Glyphs plumb one colour channel.** The checkbox `mark` (and the radio
  ring + dot) draw with `currentColor`, so a single `color` declaration
  recolours them; internal state colouring moved onto the same channel
  (tv `text-on-primary`/`text-on-error` utilities on the mark).
- **The group→radio contract inverted.** `c-radio-group` no longer pokes
  `input.checked/.disabled/.tabIndex` inside each radio's shadow root; it
  calls the radio's `_syncGroupState` hook, which applies those writes AND
  mirrors the custom states. `_`-prefixed exposed names are internal
  contracts, excluded from the manifest by the analyzer.

## Considered alternatives

- **Reflected `data-*` attributes** (`c-checkbox[data-checked]`): works in
  every `::part()`-capable browser and shows in devtools, but pollutes host
  markup and invites consumers to set them (silently doing nothing).
  Rejected — states are unforgeable and invisible in markup.
- **Conditional part names** (`part="indicator indicator-checked"`): no new
  platform dependency, but breeds a region×state part vocabulary and bends
  "part = region". Rejected.
- **Additive parts beside the misnamed `indicator`** (`box`, `ring`):
  non-breaking, but permanently enshrines the ripple-surface misnomer the
  complaint stems from. Rejected while breaking is still cheap.
- **Single-`currentColor` plumbing without state exposure**: smallest diff,
  but one colour channel cannot express "green fill, white mark, grey
  border", and no per-state styling at all. Rejected as not meeting the
  requirement.

## Consequences

- **Breaking for any `::part(indicator)` consumer**: the part now targets
  the box/ring, not the 42px circle. The ripple surface is no longer
  consumer-stylable at all (per the glossary it never should have been);
  hover/focus looks remain internal.
- Per-state styling requires `:state()` support; in older browsers the
  rules simply don't match and the control keeps its default look —
  fail-safe degradation.
- Every future component with otherwise-invisible interaction state is
  expected to expose it via `useHostStates` + `@cssstate` rather than
  inventing attributes or extra parts.
- Fixed en route: the checkbox never set the inner input's `indeterminate`
  DOM property, so the indeterminate box never filled; it now binds
  `:indeterminate.prop`.
