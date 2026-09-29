# Input masks for c-text-field and c-date-picker

## Context
We want to add input masks to the `c-input`-based components. Only two of them have a value field you can type in: `c-text-field` and `c-date-picker`. `c-select`, `c-autocomplete` and `c-tree-select` have readonly value fields. Nothing in the library shapes text while it is typed today. `c-date-picker`'s `format` only displays the date and parses it when committed (ADR-0057). The goal is typed text that follows a pattern as the user types, such as phone numbers, postal codes, IBANs or dates. Validation wording stays with the consumer, as the error-message contract requires.

## Decisions (from the grilling session, 2026-09-29)
1. **Scope:** `c-text-field` (single-line `<input>` only, not the textarea) and `c-date-picker`.
2. **Value contract:** `value` carries the **masked text as shown** (`'+358 40 123 4567'`). A read-only `unmaskedValue` gives only the characters that fill the mask slots (`'401234567'`).
3. **Syntax:** the `mask` prop is an attribute-friendly pattern string:
   - `#` is a digit, `A` a letter, `*` a letter or digit.
   - `\` escapes a literal.
   - Every other character is a literal.
   - Each pattern has a fixed length. There are no arrays, custom tokens or functions.
4. **Literals are inserted lazily.** A literal appears when the next token character is typed, so an empty field stays `''` and backspace behaves like plain text. A typed character that equals the next literal is consumed as that literal, so pasting `+358401234567` works.
5. **Incomplete fields report a fact.** The field keeps the text as typed, and the host exposes `maskComplete` (read-only) and `:state(incomplete)`. There is no built-in error message; this mirrors the date picker's **bad input**.
6. **Programmatic `value`:** the displayed text is conformed through the mask, but nothing is emitted (the rule that value controls emit only on interaction still holds). The model keeps what the consumer set until the user edits. usage.md tells consumers to pass masked values.
7. **Date picker:** the mask is always on and derived from `format`, with no new prop.
   - Digits flow into the tokens, and separators are inserted lazily.
   - A variable-width token (`d`, `M`) closes early on any typed separator, or when its first digit can't start a valid two-digit value (day 4–9, month 2–9).
   - A typed separator is normalised to the format's own literal.
   - Other characters are dropped.
   - Commit, lenient parsing (for paste and programmatic text) and bad input are unchanged.
8. **Engine:** our own, in `src/shared/`, with no new dependency.
9. **Events:** no new event. Handlers read `el.unmaskedValue` and `el.maskComplete`, so the event map and the React wrapper are unchanged.
10. **Defaults decided without asking:**
    - The mask applies only to `type` text, tel and search. Browsers throw on caret control for number, email and date, so the mask is ignored for other types, and this is documented.
    - A mask made only of `#` sets `inputmode="numeric"` unless the consumer set one.
    - During IME composition (`isComposing`), text is not conformed.

## Implementation

### 1. Shared engine: `packages/csc-ui/src/shared/inputMask.ts` (new)
- The pure core:
  - `compileMask(pattern)` turns a pattern into a slot list. There are two slot kinds: a token slot (a predicate, min and max width, and closer rules) and a literal.
  - `conformMask(slots, text, caret)` returns `{ text, caret, unmasked, complete }`. It walks the input, keeps only the characters that fit, consumes characters that match a literal, inserts literals lazily and maps the caret by counting the accepted characters before it.
- `compileDateMask(format)` in `c-date-picker/dates.ts` reuses the existing format tokenizer. It emits width-1..2 digit slots with first-digit closers for `d` and `M`, a width-4 digit slot for `yyyy`, and literal slots that accept any of `. / - space` and normalise them.
- Handling edits:
  - Deleting a literal in the middle of the text re-conforms, which puts the literal back. So Backspace on a literal deletes the token character before it: check `inputType === 'deleteContentBackward'` and whether the caret sat just after a literal.
  - Delete (forward) does the same with the next character.

### 2. Composable: `packages/csc-ui/src/shared/useInputMask.ts` (new)
- `useInputMask(inputRef, slots: Ref<Slots | null>)` returns `apply(event)`, to be called first in the component's `onInput`. It conforms the text, writes `el.value`, calls `setSelectionRange` and returns the conformed result.
- It also returns `conform(text)` for programmatic values.
- Keep the `:value` template binding (memory: never let a v-model on `c-*` clobber the model). The inner input shows the conformed text, and `el.value` is re-synced when a programmatic `value` arrives.

### 3. `c-text-field/CTextField.vue`
- Add a `mask?: string` prop with a JSDoc tag.
- In `onInput` and `onChange`, run the mask before `trimWhitespace` and `emitModelValue`.
- Bind the input's `:value` to the conformed display.
- `defineExpose({ maskComplete, unmaskedValue })`. Set the state with `useHostStates()` (`setState('incomplete', …)`), following `CDatePicker.vue:863,1100,1965`. Add `@cssstate incomplete`.
- Derive `inputmode`.
- Refresh `api.snapshot.json` and run `pnpm ui docs:manifest`. Check that the React wrapper regenerates cleanly.

### 4. `c-date-picker/CDatePicker.vue`
- Wire `useInputMask` into the start and end inputs with the slots from `compileDateMask(format)`. Leave commit, parse and `badInput` untouched.

### 5. Docs
- `c-text-field/usage.md`: document the mask section, the token table, the masked-value contract, `unmaskedValue` and `maskComplete` / `:state(incomplete)`, and which types support a mask. c-text-field has no usage.md yet. If the component's description still comes from elsewhere, create one per ADR-0026.
- `c-date-picker/usage.md`: document the typing behaviour.
- `packages/csc-ui-documentation/app/examples/c-text-field/masked.*`: add the Vue canon (v-model plus explicit imports) and the flavor variants (ADR-0020/0024), then run the parity script.
- **CONTEXT.md glossary:** add **Input mask** (the pattern that shapes typed text), **Mask token** / **Literal**, and **Complete** (every token slot filled; avoid "valid"). Extend **Date picker** with "typing follows the format". Add `incomplete` to the list of custom states.
- **ADR-0059 "Input masks conform typed text and the value carries the masked text":** cover the value contract, lazy literals, reporting incompleteness as a fact and our own engine. Rejected alternatives: raw value, eager literals, Maska/imask, and a new event. Mark it as extending ADR-0057 (typing behaviour only).

### 6. Changesets and commits
- `Feat(c-text-field): Add input masks` with its own changeset.
- `Feat(c-date-picker): Insert format separators while typing` with its own changeset (memory: one changeset per commit).
- Copy this plan to `/workspace/_plan/input-masks.md` (repo convention).

## Verification
- `src/shared/inputMask.node.spec.ts` (node), covering:
  - each token kind, escapes and literal consumption
  - lazy literals, including an empty field with a prefix mask staying `''`
  - backspace and delete over literals
  - paste of formatted and unformatted text
  - caret mapping
  - completeness and `unmaskedValue`
  - the date rules: `d.M.yyyy` with `4` → `4.`, `1` then `.` → `1.`, `12` → `12.`, typed `/` normalised to `.`
- `c-text-field/CTextField.spec.ts` (new, browser), covering:
  - typing into a masked field emits masked `update:value`
  - `unmaskedValue` and `maskComplete`, and `:state(incomplete)` toggling
  - a programmatic value is conformed without emitting (checked with `recordEvents`)
  - the mask is ignored for `type="email"`
  - `inputmode`
- `CDatePicker.spec.ts`: typing `01012026` with `dd.MM.yyyy` shows `01.01.2026` and commits `2026-01-01`, and bad-input behaviour is unchanged.
- Run one spec file at a time (devcontainer OOM memory): `pnpm ui test -- src/shared/inputMask`, then each component spec.
- `pnpm ui lint`, `pnpm build`, and the docs example smoke `pnpm --filter csc-ui-documentation test`.
- Check the docs page (`pnpm dev`, port 3500) by typing into the masked example.
