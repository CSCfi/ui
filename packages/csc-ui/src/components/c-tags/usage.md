A group of `c-tag` elements laid out in a wrapping row, with an optional
group label above them.

Put the tags in the default slot; the row wraps onto further lines when it
runs out of width. The group holds no value and fires no event of its own:
what a tag means, whether it is active and when it is removed are up to you.

```html
<c-tags label="Research fields">
  <c-tag active>All</c-tag>
  <c-tag>Biosciences</c-tag>
  <c-tag>Chemistry</c-tag>
</c-tags>
```

## When to use

- Showing a set of keywords, categories or applied filters, one tag each.
- For picking several values in a form, use `c-select` or `c-autocomplete`
  with `multiple`; they show each pick as a tag inside the field.
- For a small set of choices that holds a value, use `c-button-group`.

## Tags

A `c-tag` takes its text in the default slot. These props combine:

- `active` paints the filled, selected look. A tag never sets it itself:
  listen for `click` and toggle it.
- `badge` shows a number or a short text in a small pill at the tag's start.
- `flat` makes the tag a plain label: no hover effect, not a button, and out
  of the Tab order.
- `closeable` adds a close button.

Pressing the close button fires `close` on that tag. The event does not
bubble, so listen on each tag; removing the tag stays your job:

```vue
<c-tags label="Topics">
  <c-tag
    v-for="topic in topics"
    :key="topic.id"
    :close-label="`Remove ${topic.label}`"
    closeable
    @close="remove(topic.id)"
  >
    {{ topic.label }}
  </c-tag>
</c-tags>
```

## Size

Set `size` on the group, not on its tags: `size="small"` renders every tag
in the group compact, and the group's size overrides a tag's own `size`.

## Accessibility

- With a `label`, the group is a `role="group"` named by it, and `required`
  adds the required marker. Without a label the row is a plain container.
- A plain tag — neither `closeable` nor `flat` — is a Tab stop announced as a
  button. It does not respond to Enter or Space by itself, and `active`
  changes only its look; nothing tells assistive technology that a tag is
  active.
- A closeable tag is not a Tab stop itself: its close button is. The button's
  accessible name is `close-label`, "Remove" by default, so give each tag a
  label naming what it removes, as in the example above.
- A flat tag is skipped by Tab.

## Customization

Restyle via CSS parts: `::part(root)` stacks the label above the row,
`::part(label)` is the group label and `::part(items)` is the wrapping row.
The tags stay in your own markup, so style them directly through their
`root` part, the tag's visible box:

```css
c-tags::part(items) {
  gap: 0.5rem;
}

c-tag::part(root) {
  font-weight: 600;
}
```
