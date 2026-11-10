A horizontal progress bar that fills a track to a known completion percentage, with an optional details line showing the value and a label.

Bind the completion percentage to `value` (0–100; out-of-range values are clamped for the bar). By default a details line renders below the progress track — the percentage plus whatever the `label` prop supplies (e.g. "57 % Uploading files"). Hide it with `hide-details`, or place it beside the track with `single-line`.

For work of unknown duration the `indeterminate` prop turns the bar into a looping sweep and hides the details line.

## When to use

- For progress whose completion percentage is known — uploads, batch jobs, multi-step processing — or, with `indeterminate`, for an unknown-duration wait that should still read as a full-width bar.
- When space is tight or each item in a set needs its own compact indicator, `c-progress-circle` is the circular determinate counterpart.
- For a plain inline activity indicator use `c-spinner`; to cover a whole region while it loads, use `c-loader`.

## Details line

The details line shows the raw `value` even when the bar clamps it, and a negative value renders the line in the error role — a hook for signalling a failed transfer while keeping the bar itself empty.

## Accessibility

The progress track is the element with `role="progressbar"`, exposing `aria-valuenow` (0 to 100) while determinate; in indeterminate mode no value is exposed. The host mirrors `aria-busy` (true while indeterminate) and a `title` tooltip with the current percentage. The progress bar is named by `label`, or, where a visible label would be redundant (a table cell), by an `aria-label` on the element. Name every progress bar.

## Customization

Restyle via the parts:

- `::part(track)`: the progress track the bar grows along. Its `background-color` is the track's colour, its `height` the bar's thickness plus the frame, and its `padding` the frame around the bar.
- `::part(bar)`: the bar showing the value, also the indeterminate sweep. Its `background-color` is the bar's colour.
- `::part(root)`: the wrapper around the track and the details line.
- `::part(details)`: the percentage and label line.

By default the bar paints the primary role on a muted track. In a forced-colors mode (Windows High Contrast) the bar paints the system highlight colour whatever its `::part()` colour.

```css
c-progress-bar.quota::part(track) {
  background-color: var(--c-surface-sunken);
  height: 12px;
  padding: 2px;
}

c-progress-bar.quota::part(bar) {
  background-color: var(--c-warning);
}
```
