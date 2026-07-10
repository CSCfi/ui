# 22. Labelable form controls via a shared label anatomy

Date: 2026-07-10

## Status

Accepted

Amended by ADR-0023 (2026-07-10): `c-tab-buttons` left the group-label set —
it is now the tabs-only adapter and is not labelable. Its place in the set
(label, `required`, prop-only label source) is taken by the new
`c-button-group`, which also inherits the `mandatory` ≠ `required`
distinction below.

## Context

Label rendering in `csc-ui-next` had forked into two ad-hoc patterns: the
text family (`c-text-field`, `c-select`, `c-autocomplete`) delegates to the
internal `c-input`, while `c-radio-group`, `c-checkbox`, and `c-slider` each
hand-roll their own `<label>` + required-asterisk markup. The copies had
already drifted (`c-radio-group`'s `aria-labelledby` points at a *hardcoded*
`id="c-radio-group__label"` — harmless across instances only because shadow
roots scope ids, but inconsistent with the `useId()` convention every other
generated id follows), and
four form-capable components had no label at all: `c-otp-input`,
`c-tab-buttons`, `c-tags`, and `c-switch`. None of those four ever had a
`label` in the Stencil package either — this is net-new API, not parity
restoration.

## Decision

**Labelability rule**: every component a user *operates inside a form* is
labelable — holding a submittable value is not a prerequisite. `c-tags`
gets a label (and `required`) even though it holds no form value today.

**Anatomy**: the label bundle is `label` prop + required asterisk
(+ `aria-required`), exactly the `c-radio-group` shape. The hint/valid/
validation message line is *not* part of the bundle — components keep
whatever message-line props they already have.

**Association modes** (see CONTEXT.md): `c-switch` gets a *field label*
(inline, like `c-checkbox`); `c-otp-input`, `c-tab-buttons`, and `c-tags`
get a *group label* — a label element referenced by `aria-labelledby` from
a `role="group"` container, not a native `<fieldset>`/`<legend>` (shadow-DOM
components render their own wrapper; a fieldset would add unwanted default
semantics and styling to retrofit).

**Mechanism**: one shared internal Vue SFC (imported into each component's
shadow root, **not** registered as a `c-*` tag) renders the label text/slot,
the required asterisk, and `useId()`-based id wiring, and stamps
`part="label"`. The existing hand-rollers (`c-radio-group`, `c-checkbox`,
`c-slider`) are refitted onto it in the same change, which replaces the
hardcoded label id with a generated one instead of cloning the
inconsistency.

**Label source**: `label` prop everywhere; default-slot fallback only where
the default slot is not already the children's home — `c-otp-input` and
`c-switch` get the fallback, `c-tab-buttons` and `c-tags` are prop-only.
The default slot never does double duty.

**Required ≠ mandatory**: `required` is a form-level demand (asterisk +
`aria-required`, enforcement stays in consumer validation). `c-tab-buttons`'
existing `mandatory` (a selection cannot be deselected) is a different
concept and keeps its name; the two may vary independently.

## Alternatives considered

- **Value-holders only** (exclude `c-tags`): rejected — the labelability
  rule would then hinge on an implementation detail (`modelValue` wiring)
  rather than on how a user experiences the form.
- **Full field anatomy everywhere** (also add hint/valid/validation to
  `c-tab-buttons`, `c-tags`, `c-switch`): rejected as speculative surface;
  the message line can be added per component when a real need appears.
- **Filtered default slot on all four** (full `c-radio-group` parity via
  MutationObserver filtering of `c-tag`/`c-tab-button` children): rejected —
  clones a fragile mechanism into two more components for a rare use case.
- **Named `slot="label"`**: rejected — would introduce a third labeling
  pattern alongside radio-group's filtered default slot and checkbox's
  default slot.
- **Copy-paste the radio-group markup** (no shared component): rejected —
  eight divergent copies of the same anatomy, each with its own id-wiring
  to keep consistent.

## Consequences

- Public API grows on four components: `label` (+ slot fallback on
  `c-otp-input`/`c-switch`) and `required` on `c-otp-input`,
  `c-tab-buttons`, `c-tags`, `c-switch`.
- `part="label"` becomes a uniform customization contract across every
  labeled component (ADR-0006).
- `c-radio-group`'s label id becomes generated; anyone styling or scripting
  against the old hardcoded `c-radio-group__label` id breaks (they should
  use `::part(label)`).
- A future reader must not "fix" `c-tags` by removing its label because it
  has no value, nor merge `mandatory` into `required` on `c-tab-buttons`.
