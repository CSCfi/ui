A value-selection field: a readonly field that opens a listbox of options — slotted `c-option` elements or an `items` array — and holds the picked value, emitting the value events that back `v-model`.

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

The row checkboxes recolour like c-checkbox's (`::part(indicator)`,
`::part(mark)`), and the tags are stylable through the `tags`, `tag` and
`tag-root` parts:

```css
c-select::part(tag-root) {
  background: var(--c-primary-subtle);
}
```

## Texts

Every built-in string — the clear and toggle button labels, a tag's remove
label, the overflow and count texts — can be replaced for another language
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
