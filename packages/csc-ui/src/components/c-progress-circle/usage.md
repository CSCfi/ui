A circular progress indicator that draws a known completion percentage as an arc around a track — the circular counterpart of `c-progress-bar`.

Bind the completion percentage to `value` (0–100; out-of-range values are clamped). The circle's diameter comes from `size` and the track thickness from `width` — both in pixels, both props rather than styles because the arc geometry is computed from them. The value arc draws at half the track's width, inset within it, mirroring `c-progress-bar`'s fill-inside-track anatomy.

Nothing renders in the center by default. To show the percentage (or an icon), slot it in yourself; at the default 32&nbsp;px size, center text is rarely legible, so pair slotted text with a larger `size`.

## When to use

- For progress whose completion percentage is known — uploads, batch jobs, quota consumption.
- **Not for unknown-duration waiting**: `c-progress-circle` is determinate-only and has no indeterminate mode. Use `c-spinner` for pure activity indication, or `c-loader` to cover a whole region while it loads.
- When vertical space is tight or many items each need their own compact indicator; otherwise `c-progress-bar` with its built-in details line is usually the better default.

## Accessibility

The component exposes `role="progressbar"` with `aria-valuemin`/`aria-valuemax`/`aria-valuenow`, so assistive technology always gets the value even when the center is empty. Name the progressbar by setting `aria-label` on the element:

```html
<c-progress-circle aria-label="Upload progress" value="72"></c-progress-circle>
```

Slotted center content is presentational to assistive technology (the value is announced from `aria-valuenow`), so duplicating the percentage as slotted text is fine.

## Customization

Restyle via the parts: `::part(track)` and `::part(bar)` accept any stroke colour (the defaults are the muted surface track and the primary arc), and `::part(content)` styles the centered slot wrapper. Keep stroke *width* on the `width` prop — the radius math depends on it.
