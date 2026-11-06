# Forms and autofill: grilling record + implementation plan

> **Status: BUILT 2026-11-05, uncommitted; phase 0 (manual password-manager matrix) and phase 7 (MyCSC
> `novalidate` check) open.** Phases 1–6 are in the working tree: `useElementInternals` (fixing custom states
> after a remount), `useFormAssociation` + `formCallbacks` in `defineElement`, 14 form-associated fields plus
> c-button / c-icon-button, `implicitSubmission.ts`, the c-text-field slotted input with `text-field.css`, the
> form-association conformance suite, usage docs, the `password-manager` canon, the migration entry and three
> changesets. Spike pages for phase 0: `temp/autofill-spike/` (gitignored; serve the repo root and open
> `/temp/autofill-spike/`).
>
> Deviations from the plan below:
> - The reset default is the `value` / `checked` attribute *as authored*, read before the element first
>   upgrades: Vue's custom element writes every string, number or `true` prop back to its attribute.
> - Validity messages come from the browser's own wording (`nativeMessage`, read off a detached native control),
>   not new `texts` keys — a bubble reads as a native field's, in the browser's language.
> - `c-autocomplete` keeps Enter for opening its list (as c-select and c-tree-select do); it only counts as a
>   text field in the Enter rule.
> - An empty single select / autocomplete / tree select submits `''`; a `required` range needs both ends.
> - No visual baseline for the slotted field: a spec asserts its input's computed box and type equal the field's
>   own input's.
> - **Added 2026-11-06: the c-button slotted button (ADR-0085, phase 4b)**, after the bench showed Proton Pass
>   needs a submit button it can read; the heading advice is gone. `disabled` on the c-button still disables
>   beside a slotted button (the browser keeps clicks from a disabled form-associated element's content), so it
>   warns to set the button's own instead of claiming it is ignored.
>
> ADR-0083 (slotted input), ADR-0084 (form association), ADR-0085 (slotted button),
> amendment lines on ADR-0023 / 0071 / 0075, and CONTEXT.md terms (**Form-associated**, **Validating form**,
> **Slotted input**, **Slotted button**; **Required**, **Bad input**, **Out of range**, **Complete**, **Error message**, **Value
> control** amended). Lands before `4.0.0` by the maintainers' choice: MyCSC is the only 4.x consumer.

## Context

Two asks, grilled together because they meet in the login form:

1. With `c-text-field-open` gone, password managers must fill `c-text-field`s, whose inputs live in a shadow root.
2. The value controls do not submit with a native `<form>`. A `c-form` that collects its children's values was
   floated.

Findings that shaped the answers:

- 3.x `c-text-field-open` was Stencil `shadow: false` + `formAssociated: true`, so it solved both.
- Nothing in 4.x is form-associated; the only `attachInternals()` is `useHostStates` (custom states). `c-button
  type="submit"` already calls `requestSubmit()` on the nearest form across shadow roots (195b86ba).
- Password managers vs shadow DOM: Chrome's built-in and 1Password fill shadow inputs that carry `autocomplete`;
  Safari Keychain (WebKit 172567), Firefox (meta bug 1629226), Enpass and KeePassXC (by default) do not. Porsche
  Design System issue 4466 (Oct 2026): a hidden light-DOM mirror helps saving, not filling.
- Vue 3.5.39 `hydrateElement` removes every extra child of a server-rendered element, even under
  `data-allow-mismatch`; csc-ui upgrades before Nuxt hydrates. A component-added light-DOM node is deleted.
- A `<form>` in a shadow root cannot own slotted controls: form ownership follows the light tree.
- Implicit submission: `<c-button type="submit">` is not a native submit button, so the browser's rule finds no
  default button — with two text fields Enter does nothing, with one it submits even while the button is loading.

## Decisions (in the order grilled)

1. **Bar**: the built-in managers of Chrome, Safari and Firefox, plus 1Password, Bitwarden and KeePassXC.
2. **The consumer slots the input** (`<c-text-field label="Password"><input type="password" …></c-text-field>`),
   the c-table precedent (ADR-0037). Rejected: the component adding it (hydration), always light DOM.
3. **The host bridges the value**: host `value` reads and writes the input; native `input`/`change` bubble through;
   the host dispatches only `update:value`.
4. **Native attributes are the input's**; the host reads them. Same-named host props are ignored, with a console
   warning when both are set. The host stamps only its class, `aria-label`, `aria-description`, `aria-invalid`,
   and `type` while revealing.
5. **Credential set**: label, hint, error message, invalid, pre/post, size, shadow, password toggle. No mask, rows,
   trim. c-otp-input keeps its autofill opt-out.
6. **Form-associated custom elements**, no `c-form`, no helper.
7. **Native constraints**: required → valueMissing, bad input, out of range, incomplete mask. `novalidate` opts
   out. Amended the same day after a review note: a consumer's `invalid` is display only — as a customError it
   locks a validate-on-submit form (the browser refuses the submit whose handler would clear `invalid`).
8. **Fourteen tags**, all value controls but `c-file-upload` (and the non-field value holders).
9. **A range submits one ISO interval** `start/end`, empty side for a half range.
10. **Reset** restores the `value`/`checked` attribute (else empty) and emits `update:value` + `input`.
11. **Enter**: the fields emulate implicit submission with `c-button[type=submit]` counted as a submit button.
12. **Invalid look**: the browser bubble only; the field's look follows `invalid` alone.
13. **`c-button` / `c-icon-button` form-associated without a value**.
14. Term: **slotted input**.
15. **A partly filled `c-otp-input`** stops a validating form (`tooShort`), like an incomplete mask.
16. **Slotted button** (2026-11-06, after bench S2–S7): a consumer-written `<button>` in c-button's default slot,
    filling its box; the button's own attributes apply, c-button paints the look, ripple and loading. Before
    4.0.0, not a 4.x minor.
17. **Credential forms** submit through a slotted button (sign up, log in, change password); every other form
    keeps `<c-button type="submit">`.

## Phase 0 — Spike (before building the rest)

A throwaway page (or the docs canon of phase 5, early): a native `<form method="post">` with a username and a
password `c-text-field`, each with a slotted input (`autocomplete="username"` / `"current-password"`), and a
`<c-button type="submit">`; a second page with `autocomplete="new-password"`. Before phase 4 exists, fake the
slotted input with a plain `<input slot="pre">` inside a `c-text-field` (the only slots today are `pre` and
`post`): what the spike tests is whether a light-DOM input rendered through a shadow layout is filled, and whether
`requestSubmit()` from a c-button triggers the save prompt. Run the current shadow-input field beside it as the
control.

Manual matrix: the Autofill Bench (https://claude.ai/artifact/3uZoE8xVvR6Bqb3HmVpveC, private, results in its
store), run by three maintainers on macOS, 2026-11-05/06. Each test is one form; the native controls (S1 sign
up, L1 log in, C1 change password) worked in every setup below.

| Setup (macOS)          | L2 log in, slotted | L3 log in, shadow | S2 sign up, slotted | S3 no sign-up heading | C2 change, slotted |
| ---------------------- | ------------------ | ----------------- | ------------------- | --------------------- | ------------------ |
| 1Password · Chrome     | works              | works             | works               | works                 | works              |
| Dashlane · Chrome      | works              | works             | works               | works                 | works              |
| Dashlane · Firefox     | works              | works             | works               | works                 | works              |
| Chrome's own           | works              | works             | works               | partly                | partly¹            |
| Firefox's own          | works              | fails             | works               | works                 | works              |
| Safari's own           | works              | works             | works               | works                 | works              |
| Proton Pass · Chrome   | works              | fails             | fails²              | fails                 | works              |
| Proton Pass · Firefox  | works              | fails             | fails²              | fails                 | works              |

S8 (sign up through slotted inputs and a slotted button, ADR-0085) works with Proton Pass (maintainer, 2026-11-06).
Still to run with the other managers: S8, L4 and C3, the shape 4.0.0 ships.
Not covered: one-time codes (O1/O2: nobody had a code source, native control included), Bitwarden,
KeePassXC, Edge, Windows, iOS, Android.

¹ Chrome suggested no new password on C2; it suggested none on the native S1 either.

² Proton Pass (its detector is `@protontech/autofill`, read from npm) classifies the *form* (login / register
/ …) from the page title, the headings within 150px of the form, the submit button's text and the fields, and
finds buttons with `form.querySelectorAll('button[type=submit], …')`, which cannot reach the native button in
c-button's shadow root. Every sign-up form whose submit
button was a c-button got nothing from Proton: bench S2–S6 in both browsers (S4 adds "Create account" as the
page title, S5 names the password `new-password`, S6 both), spike step 4, and spike E (native inputs, c-button,
"Create account" heading and title). Every one with a native submit button got a generated password: bench S1,
bench S7 (S2 with a native button in place of the c-button, both browsers), spike A, B and C (slotted inputs,
native button). Spike D (slotted inputs, c-button) once got one, the only
outlier, and the heading advice rested on it. So the page's wording does not stand in for a submit button Proton
can read; the usage doc's heading advice is wrong. Logging in and changing a password work with a c-button.
The slotted button (ADR-0085) gives Proton that button: S8 works. Variants live in `temp/autofill-spike/` (A–E).

Also check: VoiceOver on Safari reads `aria-description` on the input (ADR-0083 flags it as unconfirmed); the
docs site under Nuxt SSR keeps the consumer's slotted input through hydration.

## Phase 1 — Shared internals

- `useElementInternals()`: one `attachInternals()` per host (a `WeakMap` host → internals), a silent `null` where
  unavailable (SSR, tests). `useHostStates` rebuilt on it.
- `defineElement(tag, component, { formAssociated })`: sets `static formAssociated = true` on the subclass before
  `customElements.define` (both the adopted-sheets and the fallback branch). The registry passes it for the 14
  tags plus `c-button` and `c-icon-button`.

## Phase 2 — Form association core (`shared/useFormAssociation.ts`)

- Inputs: the reactive `name`, a `formValue()` (→ `string | FormData | null`), a `validity()` (→ flags, message,
  anchor element), the default read from the host attribute, a reset writer, and the disabled-by-fieldset ref.
- `setFormValue` on every value or name change; `null` when there is no `name` or (c-text-field) an input is
  slotted.
- Serialisers per decision 9 table (ADR-0084 "What submits"); the ISO interval helper is shared by the date and
  time pickers.
- Validity: `setValidity(flags, message, anchor)`; a failed flag needs a non-empty message (TypeError otherwise).
  c-text-field and c-number-field mirror their inner input's own `validity` and `validationMessage` (this brings
  the `type="email"`/`url`/`min`/`max` checks), then add the incomplete mask; the consumer's `invalid` is never
  reported (decision 7). Where no inner input
  holds the constraint (selects, pickers, groups), the message comes from a `texts` key — add it to every affected
  tag's texts type and to the docs texts examples in all four flavours (feedback: texts examples set every key).
- `formResetCallback` → the attribute default (or empty), written through the component's model path so
  `update:value` + `input` fire and `change` does not. Mind the Vue CE prop-write hazard (memory: prop write in
  a watcher) — the callback is not a watcher, but verify the next prop write lands.
- `formDisabledCallback` → an `effectiveDisabled = disabled || fieldsetDisabled` every template reads instead of
  `disabled`.
- No `formStateRestoreCallback`.

## Phase 3 — Per-tag rollout

- The 14 tags: wire `useFormAssociation`; add `name` to c-switch, c-radio-group, c-otp-input, c-button-group;
  rewrite every "not form-associated, so it does not submit" docblock (c-text-field, c-checkbox, c-slider, …).
- `useImplicitSubmit(host)`: on Enter (no modifier, not composing, no panel open), find the form owner, the first
  submit button in tree order (`button[type=submit]`, `input[type=submit|image]`, `c-button[type=submit]`, the
  `form` attribute honoured); disabled or loading → nothing; else `click()` it; none → `requestSubmit()` only if the
  form has one text-like field (native or c-*). Used by c-text-field (and its slotted input, with
  `preventDefault` on the native Enter), c-number-field, c-otp-input, c-autocomplete (closed), the pickers' value
  fields (panel closed).
- c-button: `closestForm()` → `internals.form`; disabled-by-fieldset joins `disabled`/`loading` in `onClick`.
  c-icon-button: fieldset disabling only.
- A partly filled `c-otp-input` reports `tooShort` (grilled 2026-11-05, like an incomplete mask); empty and
  `required` reports `valueMissing`.

## Phase 4 — c-text-field slotted input

- Default `<slot>` placed in c-input's field cell; adopt the first assigned `<input>` on `slotchange`
  (idempotent, like c-table); ignore anything else with a console warning.
- `MutationObserver` on the input's attributes → `required`, `disabled`, `readonly`, `type`, `placeholder` refs
  that the label, asterisk, toggle and floating-label logic read.
- Value bridge: host `value` getter/setter pass through; listen to the input's `input` → `update:value` only.
  The `containNativeInput` stop in `defineElement` already lets a slotted input's events through.
- Stamp: class, `aria-label` (from `label`, unless the consumer set one), `aria-description` (hint / error
  message), `aria-invalid`; password toggle flips the input's `type`. Label press focuses the input. Point
  `useIdReferences` at the slotted input.
- Ignored-with-warning while slotted: `mask`, `rows`, `trim-whitespace`, and host `type`/`name`/`autocomplete`/
  `required`/`disabled`/`readonly`/`placeholder`/`min`/`max`/`step`/`autocapitalize`/`autocorrect`/`autofocus`
  when set on both.
- `injectTextFieldStyles` (modelled on `injectTableStyles`): one unlayered `<style>` per document, scoped
  `c-text-field > input.<class>`, SSR-guarded, with the `::placeholder` and autofill (`:autofill`) looks.
- Form: host `setFormValue(null)` and valid while slotted; Enter → `useImplicitSubmit`.

## Phase 4b — c-button slotted button (ADR-0085, built 2026-11-06)

- Adopt `:scope > button:not([slot])` from a host child observer; the root renders as a painting `<span>`, the
  content wrappers turn `display: contents` so the button is the root's grid item and inherits its corners.
- `button.css` + `injectButtonStyles` (the text field's pattern): the button fills the root and reads
  `--_c-button-pad-x` (per size), `--_c-button-ring` (per appearance; the root's own ring reads it too) and
  `--_c-button-label-opacity` (0 while loading).
- `loading` (and `disabled` on the c-button) cancel the button's clicks in a capturing listener; the disabled
  look follows the button's `disabled` and a disabled fieldset. `type`, `href`, `target`, `value` and the
  `icon` / `description` slots warn.
- `implicitSubmission.ts` skips a c-button framing a slotted button; the button counts as itself.
- Specs in `CButton.spec.ts` (paint, ring and hover parity, native submit, loading, disabled, warnings); the
  `password-manager` canon submits through one in every flavour.

## Phase 5 — Tests

- Behaviour specs per change, colocated; every Fix adds one that fails first.
- A **form-association conformance suite** over every registered tag: each value control is form-associated
  except a pinned list (c-file-upload, c-tabs, c-accordion, c-modal, c-pagination) — so a new value control
  enrols itself. Per tag: its `FormData` entry for a set value, reset to the attribute with `update:value` +
  `input` and no `change`, a disabled fieldset disabling it, a required empty one failing `checkValidity()`, and
  `novalidate` letting it submit, and `invalid` alone never failing `checkValidity()`.
- c-text-field slotted input: stays a light-DOM child, keeps the consumer's attributes, `input.form === form`,
  value bridge both ways, one `input` per keystroke at the host, password toggle, label press, Enter rules (two
  fields + c-button, one field + loading c-button, disabled fieldset).
- Visual baselines for the slotted field in both theme modes (`pnpm ui test:update`, one spec file per run in the
  devcontainer).
- Three engines in CI (ADR-0077): form association is engine-sensitive, no `chromiumOnly`.

## Phase 6 — Docs, migration, release

- c-text-field usage.md: "Password managers and autofill" (slotted input, `autocomplete` tokens, the ignored
  props) and canons in all four flavours: a login form and a new-password form.
- A forms section (c-button usage.md or a getting-started page): native `<form>`, `FormData`, what each control
  submits, `novalidate`, reset, Enter.
- `migration-api.ts`: `c-text-field-open` → "use `c-text-field` with a slotted input"; `name` now submits.
- React wrappers regenerated and committed (new `name` props).
- A changeset per Feat/Fix commit.

## Phase 7 — MyCSC (check before 4.0.0 ships; the repo is not in the csc-ui devcontainer)

- **Required migration step, unverified so far.** A failed native check means the form's `submit` event never
  fires, so a submit handler's own checks and error messages do not run. Find every `<form>` around c-* fields
  with `required` (or a mask, `min`/`max`, a picker that can hold bad input) and no `novalidate`; add
  `novalidate` wherever the app validates itself. Grep both `<form` in templates and any form component
  wrappers.
- **Required migration step, unverified so far: Enter now submits.** Until now Enter in a c-* field inside a
  `<form>` only committed the value. Now Enter in a text, number, code or closed picker field clicks the form's
  first `<c-button type="submit">`, or, with no submit button and one text field, submits the form. A form
  without a submit handler that cancels the browser's submit (`@submit.prevent`) then reloads the page and loses
  unsaved input. For every `<form>` around c-* fields: make sure its submit is handled, and decide whether
  Enter-to-save is wanted there; where it is not, cancel the Enter keydown on the form
  (`@keydown.enter.prevent` on the field, or a form-level keydown listener), which the fields honour.
- Any password, username or one-time-code field → slotted input, and its form's submit button → slotted button.

## Follow-ups (not in 4.0.0)

- A submit button's own `name=value` in the `FormData` (`requestSubmit()` takes only native submitters); a
  slotted button submits its own natively.
- `formStateRestoreCallback` (back/forward restore).
- `c-file-upload` in a form (`local` entries' files).
