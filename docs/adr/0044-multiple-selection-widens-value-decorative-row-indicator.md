---
status: accepted
---

# Multiple selection widens `value` and renders a decorative row indicator

`c-select` and `c-autocomplete` gain a `multiple` mode. In it the existing
`value` prop holds an array and the existing value events (`changeValue` +
twin, `update:value`, `input`) carry that array; each option row shows a
decorative checkbox indicator and toggles without closing the panel; the
selections render as `c-tag`s inside the field, folded by `max-tags`.

## Context

The value-selection fields held exactly one value. The library already had
two ways of modelling a plural selection: `c-button-group` / `c-accordion`
widen `value` to an array behind a boolean `multiple`, while `c-data-table`
keeps the selection in a separate `selected` prop with a `change:selected`
event. A multiselect listbox also needs a per-row selected affordance, and
the obvious building block — a `c-checkbox` inside each `role="option"` row
— is a nested interactive control: its native input stays focusable, it
emits its own value events, and a click would toggle twice.

## Decisions

- **The selection lives in `value`** (the button-group model), not in a
  separate prop: a field has one value and `v-model` must keep working.
  Consequence: `value`'s type now contains an array, so the manifest no
  longer lists a `value` *attribute* for either component (arrays have no
  attribute form); consumers bind the property (`v-model`, `:value.prop`,
  `el.value = …`). The scalar single-mode contract is unchanged.
- **The array is in selection order** — ticking appends, unticking removes.
  `c-button-group` re-sorts to DOM order because every button is always
  present; with `external` autocomplete data an earlier selection may no
  longer be in the option list, so option order is undefined there.
- **The row checkbox is decorative.** The option row stays the only
  interactive target (WAI-ARIA multiselect listbox: `aria-multiselectable`
  on the listbox, `aria-selected` on rows); the indicator is `aria-hidden`
  and unfocusable. It is drawn by one shared internal SFC
  (`src/shared/SelectionIndicator.vue`) extracted from `c-checkbox`, so it
  stays pixel-identical and stamps the same `indicator` / `mark` parts into
  each host's `::part()` contract (the ADR-0035 recipe carries over:
  `c-select::part(indicator) { color }`). The docs analyzer merges the
  static parts of an imported shared SFC into the host's contract for the
  same reason.
- **Toggling never closes the panel**; Escape, Tab and light dismiss do.
  In `c-autocomplete` the query is kept after a toggle (it still resets on
  open, ADR-0029) so several matches can be ticked in a row.
- **Tags in the field are `c-tag` elements**, closeable, with the × as the
  only tab stop; a `closeable` `c-tag`'s host therefore stops acting as a
  `role="button"` tab stop everywhere (it was a nested-button violation).
  The tag label is hidden from assistive technology: the readonly combobox's
  value already reads the whole selection, and the × is named
  "Remove <label>".

## Considered alternatives

- A separate `selected` array prop + `change:selected` (the data-table
  model). Rejected: two competing value channels on one field and no
  `v-model` in multiple mode.
- A real `<c-checkbox>` per row, made inert. Rejected: 42px ripple surface,
  message strip and a shadow root per row; unreachable via `::part()`
  through two boundaries; still a foreign element inside `role="option"`.
- Re-authoring the checkbox glyph per component. Rejected: three copies of
  a visual ADR-0035/0039 already tuned once.
- Auto-fitting the tag row to the field width. Deferred: needs runtime
  measurement; the numeric `max-tags` cap covers both requested shapes
  ("N tags then +X more" and "X selected") and could grow a `'responsive'`
  value later.

## Consequences

- Any new plural-selection field follows this shape: boolean `multiple`,
  array in `value`, selection order.
- `c-tag` is now rendered inside another component's shadow root for the
  first time; its `close-label` prop exists so the host can name the ×.
- User-visible strings the fold introduces go through a `texts` object prop
  (the `c-data-table` pattern), which also localises the field chrome that
  was hardcoded before; `c-autocomplete`'s lone `no-results-text` prop is
  removed in favour of `texts.noResults`.
- `option-as-selection` is ignored in `multiple` mode: the tags are the rich
  selection display.
