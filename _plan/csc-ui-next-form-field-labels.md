# Form-field labels: shared anatomy + four new labelable components

Decisions recorded in [ADR-0022](../docs/adr/0022-labelable-form-controls-shared-label-anatomy.md);
terminology in [CONTEXT.md](../CONTEXT.md) (§ Form fields: label, field label,
group label, required, mandatory).

## Summary

Give every component a user operates inside a form a label. Anatomy is
`label` prop + required asterisk + `aria-required` (the CRadioGroup bundle),
implemented once in a shared internal SFC and reused everywhere. Message-line
props (hint/valid/validation) are untouched.

## 1. Shared internal label component — DONE

- [x] `src/shared/FormLabel.vue` — plain Vue SFC, **not** registered via
      `defineElement`, no `c-*` tag; imported and rendered inside each
      consumer component's shadow root (as `<form-label>`; safe because
      `isCustomElement` only claims `c-*` tags).
- [x] Renders: label text from prop, slot passthrough for fallback content,
      required asterisk (`aria-hidden="true"`), stamps a `part` (default
      `label`; c-checkbox passes `content`), configurable `tag`
      (label/span/div) and `html-for` for field-label association.
- [x] Id wiring: hosts derive a label id from their `useId()` value and pass
      it via `label-id`, pointing `aria-labelledby` (group label) or `for`
      (field label) at it. No hardcoded ids.
      NOTE: usage sites must ALSO carry a literal `part="label"` attribute —
      the manifest analyzer verifies `@csspart` tags against static `part=`
      attributes in the component's own template.
- [x] Styling via tailwind-variants slots (ADR-0004); semantic tokens only.
      No `<style>` block (a non-element SFC has no shadow root of its own).

## 2. New labelable components — DONE

| Component | mode | label prop | slot fallback | required |
|---|---|---|---|---|
| `c-otp-input` | group | add | yes (default slot is free) | add |
| `c-tab-buttons` | group | add | **no** (slot = children) | add |
| `c-tags` | group | add | **no** (slot = children) | add |
| `c-switch` | field | add | yes (existing slot behavior kept) | has one already |

- [x] Group components: wrapper gets `role="group"` +
      `aria-labelledby=<generated id>` when a label is present
      (c-otp-input's root carries `role="group"` unconditionally).
- [x] `c-switch`: prop fills the existing `<label>` root; default slot stays
      the fallback (matches `c-checkbox`'s prop-or-slot pattern);
      `aria-required` added on the input.
- [x] `c-tab-buttons`: `mandatory` untouched; `required` is a separate new
      prop (ADR-0022 — do not conflate). Docs sharpened on both props.
- [x] Event maps / manifest: no new events; manifest regenerated
      (`docs:manifest:strict` green, props 347/347 described).
- Layout notes from implementation: c-otp-input's root changed from the
  inline-grid to a flex column (label / digits grid / message) — the
  `digits` part is new and the c-message grid escape-hatch is gone.
  c-tags gained a shadow structure (root column > items row; `<slot>` is
  `display:contents` so slotted tags stay flex items of the items row) and
  its `:host` is now `display:block` instead of the flex box.

## 3. Refits (same change) — DONE

- [x] `c-radio-group`: hand-rolled label markup replaced with FormLabel;
      hardcoded `id="c-radio-group__label"` replaced by a `useId()`-derived
      id (the hardcoded id never actually collided — shadow roots scope
      ids — but was inconsistent with every other generated id). Filtered
      default-slot fallback behavior kept; `aria-required` added on the
      radiogroup.
- [x] `c-checkbox`: label content + asterisk refit onto FormLabel
      (`part="content"`, `tag="span"`); outer `<label for>` pairing
      untouched.
- [x] `c-slider`: refit; visible text preserved (label + ariaLabelInternal,
      as seeded) and the label now carries `for=<input id>`.
- [x] `part="label"` verified present on all refitted components
      (manifest lint enforces docblock ↔ template parity).

## 4. Docs & verification — DONE (except changeset: N/A)

- [x] Examples: otp-input `basic` variants synced with the Vue canon's
      `label="OTP"`; new `label` examples (all four flavors) for
      c-tab-buttons, c-tags, c-switch. Example-parity check green.
- [x] `usage.md` added for c-tab-buttons (required vs mandatory, label
      a11y).
- [x] Visual verify light/dark via static demo + playwright-core: 23 DOM
      assertions (label text/asterisk, aria wiring, slot fallbacks,
      unlabeled regressions, tags layout, tab-buttons indicator) all pass;
      screenshots eyeballed in both modes.
- [x] A11y: group components announce their label via `role="group"` +
      `aria-labelledby`; ids generated per instance.
- [x] Package build (vite + vue-tsc + strict manifest), eslint, lint:tokens,
      lint:a11y, docs typecheck: all green.
- Changeset: N/A — no changesets infrastructure in this repo (releases via
  release-please).

### Post-fix: docs ExampleBlock style leak (found via the label example)

The c-tab-buttons `label` example initially rendered "broken" on the docs
site: ExampleBlock's scoped `c-tab-buttons::part(...)` rules (styling its
own flavor-switcher tabs) also matched the demo, because Vue stamps a
parent's scope id onto a child component's **root** element and the label
example's single root *is* a `c-tab-buttons`. Fixed by scoping the flavor
tab restyle to an explicit `[data-flavor-tabs]` hook — a data attribute
rather than a class, because c-tab-buttons imperatively does
`classList.add('c-tab-buttons')`, and a class binding in the template makes
Vue's hydration checker flag that mutation as a class mismatch.
Rule of thumb for docs components: never style bare `c-*` selectors in
scoped CSS; always add an explicit attribute/class hook.
