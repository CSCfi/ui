# 23. Split c-tab-buttons into c-button-group and a tabs-only adapter

Date: 2026-07-10

## Status

Accepted

Amends ADR-0022 (moves `c-tab-buttons` out of the group-label set, replaced
by `c-button-group`).

Amended by ADR-0025 (2026-08-10): the "single-select keeps the signature
sliding indicator" split is reversed — `c-button-group` renders no indicator
in any mode; the sliding indicator moves into `c-tab-buttons`.

## Context

`c-tab-buttons` conflated three roles: a standalone segmented value picker
(`value`, `mandatory`, deselect-to-empty, v-model, and — since ADR-0022 —
`label`/`required`), the tab controller for `c-tabs` (the `tabs` prop, set
imperatively by `c-tabs`), and the visual owner of the sliding active
indicator. The `isInTabsMode()` branching inside the component, and a stale
cross-component query in `c-tabs` (`tabsList()` still queried
`:scope > c-button` although the rewrite's children were `c-tab-button`),
were symptoms of the conflation.

In the Stencil package, standalone value-picking is the *public documented*
use of `c-tab-buttons` ("Content Selectors" group); `tabs` is `@private`.
The rewrite had also introduced `c-tab-button`, a wrapper child that exists
in no Stencil release.

## Decision

**New component `c-button-group`** — the standalone, form-facing value
control:

- A **labelable value control** per ADR-0022: group label + `required`.
  Explicitly *not* form-associated (no `ElementInternals`, no `name`, no
  native submission) — form association would be a library-wide decision,
  out of scope here.
- `value` + v-model with **new-style all-lowercase events** per ADR-0017:
  `update:value` + `change`. No `changeValue`, no kebab twin — the
  grandfathering applies to migrated tags, not new ones.
- `multiple` allows several active buttons; `value` becomes an array,
  supported as a property/v-model only (arrays have no attribute form).
- `mandatory` moves here and generalizes: the selection can never become
  empty — with `multiple`, the last active button cannot be toggled off.
- Children are **plain `c-button`s**, restoring Stencil-era authoring.
  Discovery is via `slot.assignedElements()`, not `:scope >` queries —
  required because the tabs adapter slot-forwards, so slotted buttons never
  re-parent into the group.

**`c-button` gains a public `active` prop** — the selected look plus
`aria-pressed`. A pressed toggle button is a legitimate standalone
`c-button` capability, so this is not group-only pollution; the group
drives it on its children instead of piercing their shadow for styling.

**`c-tab-button` is deleted.** It never shipped in Stencil; its docs
examples, tag-map, and React-wrapper entries go with it.

**`c-tab-buttons` survives only as the tab-strip adapter** — a composed
child of `c-tabs`, wrapping `c-button-group` in its shadow. It loses
`tabs` (implied), `label`, `required`, and `mandatory` (tabs forbid
deselection inherently, so the prop could never act). The Stencil markup
`<c-tabs><c-tab-buttons><c-button>…` stays byte-identical on upgrade.
Standalone `c-tab-buttons` is a **documented upgrade break**: the
migration guide points to `c-button-group` (tag rename + event rename).

**Active-fill rendering is split by mode**: single-select keeps the
signature sliding indicator (the group suppresses the children's own
active fill and keeps only the text flip); `multiple` drops the pill and
each active button paints its own `active` look.

## Alternatives considered

- **Status quo** (dual-mode `c-tab-buttons`): rejected — the tab-controller
  and form-control concepts have different ARIA, labeling, and value-
  ownership stories; ADR-0022 had just bolted form anatomy onto a component
  that is half tab strip.
- **Name it `c-toggle-group` or `c-segmented-control`**: rejected for
  consumer familiarity and Stencil-era authoring continuity; the glossary
  now guards the ambiguity ("a button group holds a value; a toolbar merely
  groups actions").
- **Keep a wrapper child tag** (rename `c-tab-button`): rejected — plain
  `c-button` children restore Stencil authoring parity, and the wrapper's
  jobs (active look, aria-pressed, focus/measure) are covered by
  `c-button.active` plus the group's existing shadow reach for geometry.
- **Group drives raw buttons imperatively with no `c-button` API**
  (Stencil style — stamped attributes, inline `--c-*` vars): rejected —
  re-couples the group to `c-button` internals, the exact coupling the
  rewrite removed.
- **Delete `c-tab-buttons` entirely** (`c-tabs` drives a slotted
  `c-button-group`): rejected — breaks every Stencil consumer's tabs
  markup, and `c-tabs` would have to special-case a component that is
  supposed to know nothing about tabs.
- **Keep standalone `c-tab-buttons` as a deprecated alias**: rejected —
  two public tags for one control, with the label/required story ambiguous
  on the deprecated one.
- **`mandatory` as single-select-only, or `min` selection counts**:
  rejected — a dead prop combination, or speculative surface; the
  "selection can never become empty" rule covers both modes in one
  sentence.

## Consequences

- Public surface: `c-button-group` and `c-button.active` are added;
  `c-tab-button` is removed; `c-tab-buttons` is demoted to a composed
  child of `c-tabs` (no standalone docs page, no form props).
- ADR-0022's group-label set changes: `c-tab-buttons` out,
  `c-button-group` in. The label/required implementation and examples just
  added to `c-tab-buttons` move to `c-button-group`.
- Migration guide gains entries: standalone `c-tab-buttons` →
  `c-button-group` (tag + `changeValue` → `change`/`update:value`);
  `mandatory` behavior is preserved on the new tag.
- `c-tabs`' stale `:scope > c-button` query becomes correct again and gets
  fixed as part of the adapter rework.
- A future reader must not "simplify" by teaching `c-button-group` about
  tabs, nor re-add form props to `c-tab-buttons`.
