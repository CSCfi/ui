# 83. c-text-field frames a slotted input for autofill

Date: 2026-11-05

## Status

Accepted. Lands before `4.0.0`, with ADR-0084
(`_plan/forms-and-autofill.md`).

## Context

`c-text-field` renders its `<input>` in its shadow root. The 3.x
`c-text-field-open` (Stencil `shadow: false`, form-associated) was the way to
a field a password manager fills; 4.x removed it, and the migration guide
said to send the field's value from code.

Password managers do not all look into shadow roots. Chrome's built-in
manager fills a shadow-DOM input that carries `autocomplete`, and 1Password
fills one. Safari's Keychain (WebKit bug 172567), Firefox's manager (meta bug
1629226) and several extensions (Enpass; KeePassXC unless a per-site setting
is on) do not. The Porsche Design System hit the same wall in October 2026
(issue 4466): a hidden light-DOM mirror input helped a manager *save* a
password but not *fill* one. The bar set for CSC is the built-in managers of
all three engines and the major extensions, which only an `<input>` in the
page meets.

## Decision

- **A consumer-written `<input>` in `c-text-field`'s default slot is the
  field's control** — the **slotted input**. The field frames it with its
  label, message line and password toggle and renders no input of its own.
  The input stays in the page, so every password manager sees it, and it
  submits and validates itself in a native form.
- **Its native attributes are the consumer's.** `type`, `name`,
  `autocomplete`, `required`, `disabled`, `readonly`, `placeholder` and the
  rest are written on the input, exactly as a password manager reads them.
  The field watches the attributes it draws from (the required asterisk, the
  disabled look, the password toggle, the placeholder beside a floating
  label). Host props of the same names are ignored while an input is slotted,
  with a console warning when both are set.
- **The field stamps only what is its own**: its styling class,
  `aria-label` from `label`, `aria-description` from the hint or error
  message, `aria-invalid` from `invalid`, and `type` while the password is
  revealed. A light-DOM element cannot point at the label and message inside
  the shadow root (ADR-0078's scoping rule), so the names travel as strings;
  the consumer's own `aria-label` or `aria-description` wins. A press on the
  visible label focuses the input. The host's own id references
  (`aria-labelledby`…) reach the input as on any field (ADR-0078).
- **The host bridges the value.** The host's `value` reads and writes the
  input's; the input's native `input` and `change` bubble through the host,
  and the host dispatches only `update:value`. `v-model` on either element,
  `@update:value` and the React wrapper all work. `change` bubbles past the
  host here, as a native control's does — the one value event that does
  (ADR-0075).
- **The credential set, nothing more.** Label, hint, error message,
  `invalid`, the `pre`/`post` slots, `size`, `shadow` and the password toggle
  apply; `mask`, `rows` and `trim-whitespace` are ignored with a console
  warning, and only an `<input>` is taken (no `<textarea>`). `c-otp-input`
  keeps its autofill opt-out: a one-time code meant for autofill is a slotted
  input with `autocomplete="one-time-code"`.
- **Styling is a document sheet scoped to the tag**, injected once per
  document and unlayered, as `c-table` styles its table (ADR-0037).
- **In a form the input speaks for the field.** The form-associated host
  (ADR-0084) submits nothing and reports itself valid while an input is
  slotted; Enter in the input runs the field's implicit submission (ADR-0084)
  instead of the browser's own.

## Considered options

- **Keep the shadow input** and document Chrome and 1Password as the
  supported managers: no work, and Safari and Firefox users type their
  passwords.
- **The component adds the input to its own light DOM** — on demand (a
  credential `autocomplete`, `type="password"`) or always, as 3.x's
  `render-outside-shadow` did. Vue's hydration removes every child of a
  server-rendered element that the virtual DOM does not know
  (`hydrateElement` in runtime-core 3.5 removes them even under
  `data-allow-mismatch`), and the elements upgrade before a Nuxt app
  hydrates, so the input would be deleted and need re-inserting by an
  observer; the node is also foreign to the consumer's virtual DOM. Always
  would spread ADR-0005's inbound style bleed over every field.
- **A hidden light-DOM mirror input** beside the shadow input: Porsche found
  it helps saving, not filling.
- **Host props forwarded onto a bare slotted input**: the same API as
  today, but the field would rewrite a node the consumer's framework owns and
  fight it over any attribute both set.
- **Full parity** (masks, trimming, a slotted textarea): a mask rewrites
  every keystroke of an input the consumer may be binding themselves, and no
  credential field needs one.

## Consequences

- `c-text-field` gains a default slot. The migration entry for
  `c-text-field-open` points to it instead of to code.
- Password managers cannot be driven from a test, so the managers in the bar
  are checked by hand against a docs example (the plan lists the matrix);
  specs assert what makes them work — the input stays a light-DOM child with
  the consumer's attributes and the form owns it.
- Safari's support for `aria-description` is unconfirmed; the plan checks
  it before release.
- A password manager classifies a form (log in, sign up, change password)
  partly from its submit button, and cannot see a `c-button`'s native button
  in its shadow root: Proton Pass offered no password on a sign-up form of
  slotted inputs submitted by a `c-button`, whatever its heading or page
  title said. A form a password manager reads submits through a slotted
  button (ADR-0085).
