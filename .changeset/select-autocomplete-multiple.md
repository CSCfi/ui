---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

c-select and c-autocomplete gain a `multiple` mode (ADR-0044). With the
`multiple` attribute set, `value` holds an array of the picked values (or
items with `return-object`), in the order they were picked, and the value
events carry that array — `v-model` keeps working. Every option row shows a
checkbox indicator and toggles without closing the list; the selections
render as removable tags inside the field, and Backspace in the closed field
removes the last one. `max-tags` folds the row: `N` shows the first N tags
and one "+X more" tag, `0` shows only "X selected". A new `texts` prop
localises those strings and the field's control labels (clear, toggle,
search, loading, no results) that were hardcoded before.
`c-select::part(indicator)` / `::part(mark)` recolour the row checkboxes the
same way they do on c-checkbox; the new `tags`, `tag` and `tag-root` parts
reach the tag row, and c-autocomplete's option rows gain the `item` part.

c-tag gains a `close-label` prop naming its close button for assistive
technology.

BREAKING: because `value` can now be an array, the manifest no longer lists a
`value` attribute on c-select and c-autocomplete — bind it as a property
(`v-model`, `:value.prop`, `element.value = …`); the single-value contract
is otherwise unchanged. c-autocomplete's `no-results-text` prop is removed:
set `texts.noResults` instead. A `closeable` c-tag's host is no longer a
`role="button"` tab stop — its close button is the interactive control — so
listen for `close` rather than key events on a closeable tag.
