A loading overlay that covers a container with a translucent scrim and a
centred spinner, with an optional message below it, while that container's
content loads.

Place the `c-loader` inside the container it should cover, and make that
container a positioning context (`position: relative`): the loader fills the
nearest positioned ancestor. It shows while it is in the page; bind `hide` to
take it away. Toggling `hide` fades the loader out and back in, which
removing it with `v-if` would skip.

```vue
<section style="position: relative">
  <c-loader :hide="!loading">Loading projects…</c-loader>
  …
</section>
```

## When to use

- Covering a region — a card, a panel, a list — while its content loads or
  refreshes, so it is not read or used half-updated.
- For a small inline wait, use `c-spinner`; for known progress,
  `c-progress-bar` or `c-progress-circle`. `c-data-table` has its own
  `loading` state.

## Message and spinner

Slot a short message to explain the wait. It fades in below the spinner
after `content-delay` milliseconds (0 by default), so a delay keeps a quick
load down to the spinner alone. `size` and `width` set the spinner's diameter
and stroke in pixels (48 and 4 by default).

## Accessibility

The scrim keeps the pointer off the covered content, but not the keyboard:
Tab still reaches controls beneath it, so make the region `inert` while it
loads where that matters. The loader adds no role, busy state or live region,
and its message is read in place but not announced when it appears. Set
`aria-busy="true"` on the covered region while it loads, and announce the
outcome yourself where the user needs to hear it.

## Customization

`::part(root)` is the overlay: the scrim, painted in the `surface` role at
80% opacity, and the primary text colour that the spinner takes.
`::part(content)` is the message.

```css
c-loader::part(root) {
  color: var(--c-secondary);
}
```
