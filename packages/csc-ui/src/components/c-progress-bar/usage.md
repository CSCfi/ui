A horizontal progress bar that fills a track to a known completion percentage, with an optional details line showing the value and a label.

Bind the completion percentage to `value` (0–100; out-of-range values are clamped for the fill). By default a details line renders below the bar — the percentage plus whatever the `label` prop supplies (e.g. "57 % Uploading files"). Hide it with `hide-details`, or place it beside the bar with `single-line`.

For work of unknown duration the `indeterminate` prop replaces the fill with a looping sweep and hides the details line.

## When to use

- For progress whose completion percentage is known — uploads, batch jobs, multi-step processing — or, with `indeterminate`, for an unknown-duration wait that should still read as a full-width bar.
- When space is tight or each item in a set needs its own compact indicator, `c-progress-circle` is the circular determinate counterpart.
- For a plain inline activity indicator use `c-spinner`; to cover a whole region while it loads, use `c-loader`.

## Details line

The details line shows the raw `value` even when the fill clamps it, and a negative value renders the line in the error role — a hook for signalling a failed transfer while keeping the bar itself empty.

## Accessibility

The bar is a native `<progress>` element exposing `role="progressbar"` with `aria-valuenow` while determinate; in indeterminate mode no value is exposed. The host mirrors `aria-busy` (true while indeterminate) and a `title` tooltip with the current percentage.

## Customization

Restyle via the parts: `::part(root)` (the outer wrapper), `::part(bar)` (the visible track around the native `<progress>`), and `::part(details)` (the percentage/label line). Colours default to the primary fill on a muted surface track.
