A filterable value-selection component: a readonly value field that opens a popover panel with a search input above the matching options.

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
