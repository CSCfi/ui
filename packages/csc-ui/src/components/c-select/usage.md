A value-selection field: a readonly field that opens a listbox of options — slotted `c-option` elements or an `items` array — and holds the picked value, emitting the value events that back `v-model`.

## Options

Options are slotted `c-option` elements or an `items` array of
`{ name, value }` entries. A slotted option's label — the text shown in the
closed field and, in `multiple` mode, in its tag — is its `name` attribute,
else the text of a `c-option-value` inside it, else the option's whole text.
Wrap the label in `c-option-value` when an option carries more than its
label, such as a description; the rest of the option's markup still renders
in the list row.

The row shows a copy of the option's markup, re-created from its HTML inside
the list. A component nested in an option — a `c-icon`, say — is therefore
configured through attributes, or props with an attribute form (strings,
numbers, booleans); object props and event listeners on option content do not
carry over. Page CSS does not reach the copy either: give the content a `part`
and style it through the field, which forwards every `part` named inside its
options:

```html
<c-option value="ts">
  <div part="language">
    <c-option-value>TypeScript</c-option-value>
    <c-icon path="…"></c-icon>
  </div>
</c-option>
```

```css
c-select::part(language) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
```

## Multiple selection

Set `multiple` to let the user pick several options. The value is then an
array of the picked options' values in the order they were picked (an array
of `{ name, value }` items with `return-object`), and `[]` when nothing is
picked. Arrays have no attribute form — bind `value` as a DOM property
(`v-model` or `:value.prop` in Vue; the React wrapper and property
assignment do this naturally). Picking an option toggles it and keeps the
list open; `clearable` clears the whole selection. `option-as-selection`
has no effect in this mode.

Each picked option shows as a tag inside the field, and the field grows as
the tags wrap. A tag's close button removes that option; Backspace in the
closed field removes the last one. Set `max-tags` to show only that many
tags and fold the rest into a single "+N more" tag, or `max-tags="0"` to
show no tags at all — the field then reads "N selected". Assistive
technology always hears the full selection as the field's value.

Set `select-all` to pin a select-all row at the top of the list. Its checkbox
shows whether none, some or all enabled options are selected; activating it
selects every enabled option, or unselects them all when they already are.
Disabled options are left alone, and the row only appears while there is
something to select. Its label is `texts.selectAll`, a function receiving the
number of listed options.

The row checkboxes recolour like c-checkbox's (`::part(indicator)`,
`::part(mark)`), the select-all row is the `select-all` part, and the tags are
stylable through the `tags`, `tag` and `tag-root` parts:

```css
c-select::part(tag-root) {
  background: var(--c-primary-subtle);
}
```

## Texts

Every built-in string — the clear and toggle button labels, a tag's remove
label, the overflow and count texts, the select-all row's label — can be
replaced for another language
through the `texts` object, merged over the English defaults. Count and
label texts are functions, so the object must be bound as a DOM property:

```vue
<c-select
  :texts.prop="{
    more: (n) => `+${n} lisää`,
    remove: (label) => `Poista ${label}`,
  }"
  multiple
/>
```

## Scrolling

The list shows `items-per-page` full rows (six by default) and then a
half-visible row instead of a scrollbar: the cut row is the cue that more
options follow, and the wheel, touch and arrow keys scroll as usual. Set
`items-per-page="0"` to let the list grow to the space the viewport allows;
it still ends on a half row when it overflows. To bring the native scrollbar
back:

```css
c-select::part(list) {
  scrollbar-width: auto;
}
```
