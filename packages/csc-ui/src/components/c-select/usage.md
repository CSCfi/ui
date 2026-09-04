A value-selection field: a readonly field that opens a listbox of options — slotted `c-option` elements or an `items` array — and holds the picked value, emitting the value events that back `v-model`.

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
