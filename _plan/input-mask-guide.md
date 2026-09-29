# Mask guide for c-text-field

## Context
Input masks are in place (ADR-0059: `c-text-field` `mask`, lazy literals, masked value, `maskComplete` / `:state(incomplete)`; all uncommitted, with changesets written). With lazy literals, an empty masked field gives no hint of the pattern: nothing of `+358 ## ### ####` shows until the first digit. The user wants the mask visible while typing, so people know what to enter. This reverses the "full guide" alternative that ADR-0059 rejected, and does it without the reasons it was rejected: the guide is aria-hidden (no screen-reader noise) and only shows when the label is out of the way (no clash with the floating label).

## Decisions (grilling, 2026-09-29)
1. **Full ghost guide:** faint, aria-hidden text behind the input showing the rest of the mask. Unfilled tokens are drawn as `_` and literals as themselves: an empty field shows `+358 __ ___ ____`, and after typing `4` it shows `+358 4` followed by the faint `_ ___ ____`. The guide is never part of the value, which stays `''` until a real character is typed. Lazy literals and every other ADR-0059 behaviour are unchanged.
2. **Visibility follows the placeholder rule** (`effectivePlaceholder` in `CTextField.vue`). The guide shows while the field is focused or holds text, and always under `label-on-top` or with no `label`. A resting, empty field under a floating label shows only the label.
3. **The glyph is `_` for every token.** A consumer `placeholder` wins: the native placeholder shows and no guide is rendered. That's also how to opt out, or to write a custom hint like `+358 40 123 4567`.
4. **Scope is `c-text-field` only.** `c-date-picker` already shows its format as the default placeholder.

## Implementation

### Engine: `packages/csc-ui/src/shared/inputMask.ts`
- Add `rest: string` to `MaskResult`: what the guide still shows after the text. It is the pending literals, plus the remaining slots from the stop index, with a token drawn as `_` (a partly filled variable-width slot counts as one `_`) and a literal as its text.
- It is `''` once the mask is complete or the closing literals were appended (`## kg` → `12 kg`).

### `packages/csc-ui/src/components/c-text-field/CTextField.vue`
- Wrap the masked `<input>` in a `grid` box, `min-w-0 flex-auto`, so the input and the guide share one grid cell (`[grid-area:1/1]`) with no absolute positioning.
- Render the guide in that cell behind the input (the input is already `bg-transparent`): `<span aria-hidden="true" part="mask-guide">`.
  - It has two children: an `invisible` span holding `displayValue`, which keeps the width of the typed text, and a span holding `maskResult.rest` in `text-on-surface-faint` (the placeholder's colour).
  - It copies the input's typography (`[font:inherit] text-base leading-5 py-2`), plus `whitespace-pre overflow-hidden pointer-events-none`.
  - Add these as a new `guide` slot in the `tv` config.
- `guideVisible` is `maskSlots && !props.placeholder && (labelOnTopResolved || !props.label || isFocused || hasValue)`. It renders the wrapper only when a mask applies, so unmasked fields keep today's DOM.
- **Scroll sync:** on the input's `scroll` and `input` events, set the guide's `scrollLeft = input.scrollLeft`, so an overflowing field keeps the ghost aligned.
- Document the part in the docblock so it lands in the manifest (`@part mask-guide - …`; check how other parts are declared, e.g. `c-date-picker`'s `separator`).
- Refresh `api.snapshot.json` (`vitest run --config vitest.node.config.ts src/api-snapshot -u`) and review the diff: one new part.

### Docs and records
- `c-text-field/usage.md`: in the Input mask section, explain the guide, when it shows, and that `placeholder` replaces it.
- `CONTEXT.md`: add **Mask guide**, the faint remainder of an **input mask** shown behind the typed text: never value, never announced. Avoid "placeholder" (the consumer's native text, which replaces it).
- ADR-0059 (still uncommitted, so amend it in place): add the guide to Decision, and rewrite the rejected "full guide" alternative as the reason for these choices (aria-hidden, shown only when the label is out of the way).
- Update the uncommitted changeset `.changeset/text-field-input-mask.md` with one sentence about the guide.
- Update the memory file `project_csc_ui_input_masks.md`.

## Verification
- `inputMask.node.spec.ts`: `rest` for an empty value (`+358 __ ___ ____`), after `4`, when complete (`''`), with a suffix (`## kg`), and for an escaped literal.
- `CTextField.spec.ts`, covering:
  - no guide at rest under a floating label; the guide appears on focus, and always with `label-on-top`
  - its text tracks typing (the `rest` span reads `_ ___ ____` after typing `4`)
  - `placeholder` suppresses it
  - it is `aria-hidden`
  - `value` stays `''` on focus, and nothing is emitted
  - its left edge matches the input's text start (compare the rects of the guide's first child and the input's content box)
  - a visual baseline via `matchScreenshotInBothModes`: a focused, empty masked field and a partly typed one (authored in the devcontainer, PNGs committed)
- Run one spec file at a time: the node engine spec, then `c-text-field` (`--update` only for the new baseline), then the conformance suites (`all-components`, `value-controls`).
- `pnpm ui lint`, `pnpm build`, and the docs example smoke (the `masked` example now shows the guide on focus).
