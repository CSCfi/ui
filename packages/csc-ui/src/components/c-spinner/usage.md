A circular indeterminate activity indicator — pure motion with no value, for waits of unknown duration.

Size the spinner with the `size` (diameter) and `width` (stroke) props, both in pixels. It spins forever; there is nothing to bind. If the wait has a known completion percentage, use `c-progress-circle` instead — the boundary is the axis (pure activity vs known value), not the shape.

## When to use

- For short, inline unknown-duration waits — inside a button, next to a field, in a table cell.
- To cover a whole container while it loads, use `c-loader`, which embeds this spinner behind a scrim with an optional message.
- For known progress, use `c-progress-bar` or `c-progress-circle`.

## Color

The stroke defaults to the primary role, so a standalone spinner is brand-coloured in either theme mode. The `color` prop accepts any CSS colour value; pass `currentColor` to make the spinner track the ambient text colour instead — the contract parent components (`c-loader`, `c-switch`) use to tint their embedded spinner.

## Accessibility

The spinner is purely visual and exposes nothing to assistive technology. Announce the loading state on the region it describes — `aria-busy` on the updating container, or a live-region message — or use `c-loader`, whose slotted message provides visible and announced context.

## Customization

`::part(root)` targets the `<svg>` drawing the circle. Prefer the `size`/`width`/`color` props for geometry and colour — the dash animation is computed from the size.
