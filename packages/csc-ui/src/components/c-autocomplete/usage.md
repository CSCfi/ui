A filterable value-selection component: a readonly value field that opens a popover panel with a search input above the matching options.

## Options

Options are slotted `c-option` elements or an `items` array of
`{ name, value }` entries. A slotted option's label — the text shown in the
closed field and in its tag, and the text the filter matches — is its `name`
attribute, else the text of a `c-option-value` inside it, else the option's
whole text. Wrap the label in `c-option-value` when an option carries more
than its label, such as a description; the rest of the option's markup still
renders in the row:

```html
<c-option value="ts">
  <c-option-value>TypeScript</c-option-value>
  <small>JavaScript with static types</small>
</c-option>
```

The row shows a copy of the option's markup, re-created from its HTML inside
the panel. A component nested in an option — a `c-icon`, say — is therefore
configured through attributes, or props with an attribute form (strings,
numbers, booleans); object props and event listeners on option content do not
carry over. Page CSS does not reach the copy either: give the content a `part`
and style it through the field:

```html
<c-option value="ts">
  <div part="language">
    <c-option-value>TypeScript</c-option-value>
    <c-icon path="…"></c-icon>
  </div>
</c-option>
```

```css
c-autocomplete::part(language) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
```

While a query is typed, the runs of each option's label that equal it are
marked: inside the `c-option-value` of a slotted option, or in the plain
label of an `items` entry. A slotted option without the wrapper is rendered
exactly as authored and never marked. Every occurrence of the literal query
is marked, whatever the filter did — a fuzzy `filter`, or a `name` that
differs from the wrapper's text, can leave a row unmarked — and the wrapper's
content is treated as plain text while a query is active. The marks are the
`match` part:

```css
c-autocomplete::part(match) {
  font-weight: 600;
}
```

## Filtering

By default the component filters its options itself: the query typed into the
search input is matched against the start of each option's label. Supply a
`filter` predicate to change the matching — it receives the normalized option
and the query, and keeps the option when it returns `true` (see the
custom-filter example). Because `filter` is a function, it must be bound as a
DOM property, not an attribute.

## External data

Set `external` to hand filtering to your own code — for example a server
search endpoint. The component then renders `items` verbatim and emits a
`change:query` event carrying the query string: on every keystroke, and with
an empty string when the panel opens (use that to load the initial,
unfiltered list). Set `loading` while a request is in flight; the panel shows
a loading row when there is nothing to display yet and keeps the current
options on screen during a refresh.

The component ships no debounce and no minimum query length — debounce the
requests in your handler and skip fetches for too-short queries yourself (see
the external example). The closed field keeps showing the selected option's
label even when a later fetch no longer includes it: the label is remembered
when the option is committed, and a programmatically set value resolves its
label from the current options, or from the object's `name` when
`return-object` is used.

## Multiple selection

Set `multiple` to let the user pick several options. The value is then an
array of the picked options' values in the order they were picked (an array
of `{ name, value }` items with `return-object`), and `[]` when nothing is
picked. Arrays have no attribute form — bind `value` as a DOM property
(`v-model` or `:value.prop` in Vue; the React wrapper and property
assignment do this naturally). Picking an option toggles it and keeps the
panel open; the search input keeps its query after a pick, so several
matches can be picked in a row. `clearable` clears the whole selection.

Each picked option shows as a tag inside the field, and the field grows as
the tags wrap. A tag's close button removes that option; Backspace in the
closed field removes the last one. Set `max-tags` to show only that many
tags and fold the rest into a single "+N more" tag, or `max-tags="0"` to
show no tags at all — the field then reads "N selected". Assistive
technology always hears the full selection as the field's value. With
`external`, a pick's label is remembered when it is made, so a later fetch
that no longer lists it keeps its tag readable.

Set `select-all` to pin a select-all row at the top of the list. It acts on
the options currently listed — the matches while a query is typed, or the
`items` you supply with `external`: activating it selects every enabled one
of them, or unselects them all when they already are, and options outside
the list keep their state. Disabled options are left alone, and the row only
appears while there is something to select. Its label is `texts.selectAll`,
a function receiving the number of listed options.

The row checkboxes recolour like c-checkbox's (`::part(indicator)`,
`::part(mark)`), the select-all row is the `select-all` part, and the tags are
stylable through the `tags`, `tag` and `tag-root` parts:

```css
c-autocomplete::part(tag-root) {
  background: var(--c-primary-subtle);
}
```

## Texts

Every built-in string — the clear and toggle button labels, the search
input's placeholder and accessible label, the loading and no-results rows,
the select-all row's label, a tag's remove label, the overflow and count
texts — can be replaced for another language through the `texts` object,
merged over the English defaults. Count and label texts are functions, so the object must be bound
as a DOM property; the `placeholder` prop still wins over
`texts.searchPlaceholder` when both are set:

```vue
<c-autocomplete
  :texts.prop="{
    noResults: 'Ei osumia',
    remove: (label) => `Poista ${label}`,
  }"
  multiple
/>
```

## Scrolling

The panel shows `items-per-page` full rows (six by default) and then a
half-visible row instead of a scrollbar: the cut row is the cue that more
options follow, and the wheel, touch and arrow keys scroll as usual. Set
`items-per-page="0"` to let the list grow to the space the panel allows; it
still ends on a half row when it overflows. To bring the native scrollbar
back:

```css
c-autocomplete::part(list) {
  scrollbar-width: auto;
}
```
