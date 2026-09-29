# Optional sections in c-text-field masks

## Context
The `c-text-field` input mask (ADR-0059, with the mask guide; all uncommitted) has fixed length only: every token is required. Real formats vary in length. A Finnish phone number's NSN (national significant number) has 5–12 digits, and a US ZIP code is 5 digits with an optional `-####`. The engine can already do variable length (the date picker's day and month slots use `min`/`max`), but the pattern syntax has no way to say it.

## Decisions (grilling, 2026-09-29)
1. **Syntax:** a part in brackets `[…]` is an **optional section**. It holds tokens and literals, so grouping survives:
   - `+358 #####[#######]` is 5–12 digits.
   - `+358 ## ###[ ####]` keeps its space.
   - `#####[-####]` is the ZIP case.
   - `\[` and `\]` escape the brackets.
2. **Each optional token is optional on its own.** A started section needn't be finished. **Complete** means every *required* token is filled. Consumers who need all-or-nothing check the length of `unmaskedValue`.
3. **The guide draws only the required remainder.** `+358 #####[#######]` shows `+358 _____`, and once five digits are in, the guide is gone.
4. **Optional sections come last.** After the first `[`, only further sections may follow (`][` is fine). Nesting, an unclosed `[`, or anything after a `]` other than `[` makes the mask invalid. An invalid mask is ignored (the field behaves unmasked) and triggers one `console.warn('[c-text-field] …')`, the library's first runtime warning. (The date picker's invalid `format` silently falls back; a mask has no sensible fallback, so it warns.) A warning doesn't fail specs; only `console.error` and `[Vue warn]` do.
5. Lazy literals apply inside sections too: the `-` of `[-####]` appears only when the sixth digit arrives, and a typed `-` is consumed as it.

## Implementation

### Engine: `packages/csc-ui/src/shared/inputMask.ts`
- **`compileMask(pattern)`** now returns `MaskSlot[] | null` (`null` means invalid). It tracks `[`/`]` and escapes, and marks every slot inside a section `optional: true`. An optional token gets `min: 0, max: 1`. It returns `null` on nesting, an unclosed section, a stray `]`, or a non-section character after the first section.
- Add `optional?: boolean` to the literal variant of `MaskSlot`. For tokens, `min === 0` is the optional marker.
- **`conformMask`** changes:
  - Close condition: a slot closes when `fill.length >= slot.min && (fill.length > 0 || slot.min === 0)`, so an empty optional token is skipped, letting a typed `-` reach the optional literal.
  - `complete`: optional slots (a token with `min === 0`, or a literal) are ignored. It stays `false` for an empty field.
  - Closing literals are appended only when every remaining slot is a *non-optional* literal (`## kg` still gives `12 kg`; `#####[-####]` never auto-adds `-`).
  - `rest` (the guide) draws the remaining slots up to the first optional slot.
- `isNumericMask`: brackets aren't tokens, so no change is needed. Add a spec to prove it.
- `compileDateMask` is unaffected (its `min` is 1).

### `packages/csc-ui/src/components/c-text-field/CTextField.vue`
- `maskSlots` uses the `null` from `compileMask`. On `null`, warn once per distinct pattern: keep the last warned pattern and `console.warn` in a `watch` on `props.mask` with `immediate`.
- Extend the `mask` prop's JSDoc: "`[…]` marks a trailing optional section".
- Refresh `api.snapshot.json` (the description changes only) and check the regenerated tag map and React wrapper.

### Docs and records
- `c-text-field/usage.md`:
  - add `[…]` to the token table
  - add a paragraph on optional sections with the phone and ZIP examples
  - note that Finnish numbers group differently by area code, so an ungrouped run (`+358 #####[#######]`) is the honest phone mask
  - state what complete means with optional sections, the trailing-only rule and the warning
- Switch the docs example `masked.*` (all five flavors) to `+358 #####[#######]`, with the hint "5–12 digits after the country code".
- `CONTEXT.md`: add **Optional section**, a bracketed trailing part of an **input mask** whose tokens may be left unfilled. Amend **Complete** to "every *required* mask token". Amend **Mask guide** to "required remainder".
- ADR-0059 (still uncommitted, amended in place):
  - add optional sections to the Decision (trailing only, each token optional, guide shows the required part)
  - add the rejected alternatives: `#{5,12}` quantifiers (no grouping inside the run), an optional-token character (verbose, costs a literal), sections anywhere (greedy or backtracking fill ambiguity), and all-or-nothing sections
- `.changeset/text-field-input-mask.md`: mention that masks can end in optional parts.
- Update the memory file `project_csc_ui_input_masks.md`.

## Verification
- `inputMask.node.spec.ts`:
  - `+358 #####[#######]`: `40123` is complete; 12 digits are complete; a 13th is dropped; 4 digits are incomplete
  - `#####[-####]`: `12345` is complete and adds no `-`; `123456` gives `12345-6` (lazy); a typed `-` is consumed
  - `## ###[ ####]` grouping
  - guide: `+358 _____`, then `+358 401__`, then `''` at five digits
  - escaped `\[#\]` is literal brackets
  - invalid patterns return `null`: `[#]##`, `##[#] kg`, `[[#]]`, `##[#`, `##]`
  - backspace trimming of an optional literal (`12345-` deleting gives `12345`)
- `CTextField.spec.ts`:
  - typing 5 and 12 digits into the phone mask: `maskComplete`, `:state(incomplete)` off at 5, extra digits dropped
  - the guide disappears at the minimum
  - an invalid mask: the field is unmasked and one warning is caught with `consoleSpy.expect(/c-text-field/)` (check the harness API for warnings)
- Run one spec file at a time: the node engine spec, then `c-text-field` (existing baselines should be unchanged), then the conformance suites; then `pnpm ui lint`, `pnpm build`, the docs example smoke and the parity check.
