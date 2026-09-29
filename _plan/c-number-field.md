# c-number-field: a number input with thousands grouping

## Context
The user asked for a mask for numeric values (integers or decimals) with a thousands separator. The slot mask (ADR-0059) can't do it. A mask fills fixed slots left to right; grouping works right to left from the decimal point, regroups on every keystroke (`1 234` → `12 345`), and comes with a sign and a decimal part. Native `type="number"` can't show separators. So this is a new **value control** whose value is a real number and whose display is grouped text. It's the same split as the date picker's ISO value and its `format` (ADR-0057). The mask work (ADR-0059, uncommitted) stays as it is. This component reuses its caret machinery.

## Decisions (grilling, 2026-09-29)
1. **A new `c-number-field`**, not a mode of `c-text-field`. `value` is a `number`, or `null` when empty. The display is grouped text such as `1 234 567,89`. `c-text-field`'s value keeps one meaning, a string.
2. **Separators** come from the page `lang` through `Intl.NumberFormat(lang).formatToParts` (fi → `1 234,5`, en → `1,234.5`). The `group-separator` and `decimal-separator` props override them, per field or app-wide through `applyDefaults` (ADR-0048). Intl supplies only these two characters; no locale prop is added (ADR-0057 rejected one).
3. **`decimals`** is the maximum number of fraction digits. The default `0` makes an integer field, where the decimal key is ignored. Typing never pads. `fixed-decimals` pads the display on blur (`12,5` → `12,50`); the value never carries padding.
4. **The value is emitted on every keystroke** (4.x events: `change`, `update:value`, `input` via `emitModelChange`). It is whatever the text reads as at that moment: `'1 234,'` → `1234`, `'-'` → `null`, `''` → `null`. On blur the display is tidied (a trailing decimal separator removed, padding under `fixed-decimals`) without emitting, because the number didn't change.
5. **`min` and `max` report a fact and never clamp.** An out-of-range number is kept and emitted, and the host exposes a read-only `outOfRange` and `:state(out-of-range)`; the consumer writes the error message. The minus key is dropped when `min` ≥ 0.
6. **Defaults decided without asking:**
   - Either `.` or `,` typed is read as the decimal separator unless it is the group separator.
   - A typed or pasted group separator (or any space) is ignored and re-inserted by the component.
   - The minus sign is accepted only at the start, as `-` or `−` (U+2212), and displayed as `-`.
   - The integer part is capped at 15 digits so the value stays an exact JS number.
   - `inputmode` is `decimal` when `decimals > 0`, otherwise `numeric`. The role stays `textbox`, with no spin buttons or arrow-key stepping.
   - A programmatic `value` is shown formatted and rounded to `decimals` for display, never emitted. A non-finite value or `NaN` shows as empty.

## Implementation

### Shared caret core: `packages/csc-ui/src/shared/inputMask.ts`
- Generalise `applyMask` into `applyConform(input, event, conform, previous, opts)`. `conform(text, caret, deleting)` returns `{ text, caret, tokenAt }`, which `MaskResult` already fits.
- The existing backspace or delete-on-a-literal rule (remove the neighbouring token character instead) applies unchanged to group separators.
- `applyMask` becomes a thin wrapper, so `c-text-field` and `c-date-picker` are untouched in behaviour.

### Number core: `packages/csc-ui/src/components/c-number-field/numbers.ts` (new, pure)
- `numberSeparators(lang)` reads the group and decimal separators from `Intl.NumberFormat(...).formatToParts(1234567.5)` and falls back to `' '` and `','`.
- `conformNumber(text, caret, { decimals, group, decimal, allowNegative, deleting })` → `{ text, caret, tokenAt, value }`:
  - keeps the sign, the digits and the first decimal separator; caps the integer digits (15) and the fraction digits (`decimals`)
  - regroups the integer part in threes from the right
  - maps the caret by counting the significant characters (sign, digits, decimal) before it
  - marks group separators as non-token in `tokenAt`
- `formatNumber(value, opts, fixed)` gives the display for a programmatic value or a tidy on blur.
- `readNumber(text, opts)` turns text into a `number | null`.
- Pasted text such as `1,234.56` under fi: when both `.` and `,` are present, the last one is the decimal separator and the other is treated as grouping.

### Component: `packages/csc-ui/src/components/c-number-field/CNumberField.vue` (new)
- Model on `CTextField.vue`: `<c-input>` with label, hint, `error-message`, `valid`, `required`, `disabled`, `readonly`, `size`, `shadow`, `hide-details`, `label-on-top`, `name`, `placeholder` and `host-id`, plus a single `<input type="text" part="input">`.
- Props: `value: number | null`, `decimals`, `fixed-decimals`, `min`, `max`, `group-separator`, `decimal-separator`.
- Defaultable props: `decimals`, `fixedDecimals`, `groupSeparator`, `decimalSeparator` and the usual field ones. Resolve them through `useAppDefault`, following `CDatePicker.vue`.
- Read the page `lang` from `document.documentElement.lang`, as the date picker's Intl fallback does. Reuse its pattern.
- `onInput` calls `applyConform` with `conformNumber`, then `emitModelChange(host, value)` only when the number changed. A `props.value` watcher re-syncs the display and never emits (hazard in `emitModelValue.ts`).
- `defineExpose({ outOfRange })` and `useHostStates` → `out-of-range`. Tags: `@csspart input`, `@cssstate out-of-range`.
- `usage.md`: the first paragraph is the description (ADR-0026). Cover the value, separators and lang, decimals, typing rules, range and validation, and the difference from `c-text-field type="number"`.

### Registration (follow `de58feb1`, the date picker commit)
- `src/index.ts` export and define. Update `src/index.node.spec.ts`, `src/api.entry.snapshot.json`, `src/test/conformance/kinds.ts` (value control), `root-part.ts` if needed, and `src/shared/appDefaults.spec.ts`.
- Regenerate the tag map, manifest and React wrapper through `pnpm build`, and add `api.snapshot.json`.
- Memory hazards: the first build after a new SFC can drop its Tailwind utilities, so grep `dist` and rebuild. The tag map also needs unique private type names, so prefix them with `CNumberField`.

### Docs and records
- Examples `app/examples/c-number-field/`: `basic` (an integer) and `decimals` (money with `fixed-decimals` and `min="0"`), each in all five flavors, using v-model and explicit imports.
- `CONTEXT.md`, **Form fields** section:
  - add **Number field** (value a number, display grouped; distinct from `c-text-field type="number"`)
  - add **Group separator** and **Out of range**, a fact like bad input
  - add `out-of-range` to **Custom state**
- **ADR-0060 "c-number-field values are numbers, grouped by the page language"**:
  - Decision: a component rather than a mask, the number value, separators from Intl with overrides, reporting the range instead of clamping, live emission.
  - Alternatives: a number mode on `c-text-field`, a spreadsheet-style `mask="# ##0,00"`, a `locale` prop, clamping, emitting on commit.
- `.changeset/number-field-component.md` (minor, both packages).
- Update memory: add a new project memory and link it from `project_csc_ui_input_masks`.

## Verification
- `numbers.node.spec.ts` covers:
  - grouping as digits are typed and deleted
  - caret mapping across inserted and removed separators
  - Backspace on a group separator deletes the digit before it
  - `decimals` of `0`, `2` and fixed; a second decimal separator is dropped
  - the minus sign at the start only, and blocked when `min` ≥ 0
  - the 15-digit cap
  - `.` and `,` both read as the decimal separator
  - pastes `1 234,56`, `1,234.56` and `1234.56`
  - `readNumber` edge cases (`'-'`, `'1 234,'`)
  - separators for `fi` and `en` from Intl, and the fallback
- `CNumberField.spec.ts` covers:
  - typing `1234567,8` shows `1 234 567,8` and emits `1234567.8` live; each event's `targetValue` is correct
  - `lang="en"` gives `1,234,567.8`, and the override props win
  - a programmatic value is formatted with no emission
  - blur tidies (`12,` → `12`, `fixed-decimals` gives `12,50`) with no emission
  - `outOfRange` and `:state(out-of-range)`
  - `inputmode`
  - visual baselines: empty, filled, and out of range with an error, in both modes
  - the conformance suites enrol it automatically
- Run one spec file at a time, then the conformance suites. Then `pnpm ui lint`, `pnpm build` (grep `dist` for the new utilities), the docs example smoke and the parity check. The mask specs must still pass after the `applyConform` refactor.
