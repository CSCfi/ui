# Plan: c-autocomplete (csc-ui-next)

Source request: `_todo/csc-ui-next-autocomplete.md`. Decisions resolved in the
grilling session below; see ADR-0009 and the **Autocomplete** / **Search input**
terms in `CONTEXT.md`.

## Resolved decisions

1. **Foundation**: new popover combobox on the Popover API + CSS anchor
   positioning (CMenu's mechanism, ADR-0008/0009). NOT `c-dropdown`.
2. **Value contract**: client-side only. `v-model` = selected option's value
   (scalar; `{name,value}` when `return-object`). Query is internal transient
   state. No async/`loading`/`changeQuery`/`minimumQueryLength`.
3. **`filter` prop**: `(option, query) => boolean` where `option` is a
   normalized `{ label, value, disabled }` (label = `name ?? trimmed
   textContent`). Default: `label.toLowerCase().startsWith(query.toLowerCase())`.
4. **Data model**: full CSelect parity — slotted `<c-option>` OR `items` prop,
   plus `return-object`.
5. **Placeholder**: lands on the in-panel **search input** (default `Search…`).
   Main field shows floating `label` when empty, selected label when set.
6. **a11y/focus**: editable combobox. Search input is
   `role="combobox" aria-autocomplete="list" aria-expanded aria-controls
   aria-activedescendant`. List is `role="listbox"`; rows `role="option"`.
   DOM focus stays in the search input; arrow keys move a virtual active option
   via `aria-activedescendant` (no real focus on rows).
7. **Scope**: component + register in `index.ts`; update docs examples (incl. a
   custom-filter example); manual verification run.

## Structure (CAutocomplete.vue)

- Trigger = `c-input` (readonly, like CSelect): displays selected option label,
  chevron toggle, clear button when `value && clearable`. Click opens panel.
  Reuse CSelect's `hide-details` data-channel forwarding and the
  `id`/`input-id` derivation.
- Anchor wrapper `<span anchor-name:--c-autocomplete-anchor>` around the field
  (anchor names are tree-scoped — must be in this shadow root, per ADR-0008).
- Panel `popover="manual"` positioned with `position-anchor` + `position-area`,
  width pinned to the anchor width; `position-try-fallbacks` in the escape-hatch
  `<style>`; `ensureAnchorPositioning` polyfill call on open (copy from CMenu).
- Inside panel: search `<input>` (autofocus on open) → `c-divider`/rule → list.
- List renders the filtered options: `<c-option>` outerHTML (option mode) or
  `items` (item mode), each row `role="option"`, selected row gets `mdiCheck` +
  `aria-selected`. Hover/active styling from the CDropdown item recipe.
- No-results row when `query` non-empty and filtered list empty: `mdiAlert`
  inline svg `text-warning-600` + `no-results-text` (default `No matching data`).
- Empty query → all options visible.

## Behaviour

- Open: click field / chevron, ArrowDown/Up on field, or typing. Focus search
  input on open.
- Filter on each keystroke via `filter` predicate over normalized options.
- Select: click row or Enter on active row → set value, emit model value
  (`emitModelValue` + `change`), close, clear query, return focus to field.
- `clearable`: clear button resets value + query.
- Escape closes and returns focus to the field; Tab closes; Home/End jump.
- Light-dismiss via pointerdown outside host (copy CMenu approach).
- Mobile: plain anchored popover (no `c-dropdown`-style full-screen). Deliberate
  simplification.

## Props (mirror CSelect minus select-only bits, plus filter)

`clearable, disabled, filter, hideDetails, hint, hostId, items, itemsPerPage?,
label, labelOnTop, loading?, name, noResultsText, placeholder, required,
returnObject, shadow, valid, validate, validateOnBlur, validation, value`.
(Drop `optionAsSelection`. `loading`/`itemsPerPage` optional — include if cheap.)

## Parts (ADR-0006)

`panel`, `search`, `list`, `option`, `info` (no-results row). Field chrome parts
come from the nested `c-input`. No `override` prop.

## Files

- `packages/csc-ui-next/src/components/c-autocomplete/CAutocomplete.vue` (new)
- `packages/csc-ui-next/src/index.ts` — import + register `c-autocomplete`
  after `c-option`/`c-dropdown`; add to the element-name export list.
- `c-option` / `c-option-value` already exist — reused as-is.
- Docs: update `app/components/examples/c-autocomplete/*` + `example-data/
  c-autocomplete/*` for the new API; add a custom-filter example.

## Verification

Build csc-ui-next, run docs dev server, verify: open/close, filter, select,
clear, no-results (orange alert), keyboard (arrows/enter/esc/home/end),
floating label + hint + validation, return-object, items-prop mode.
