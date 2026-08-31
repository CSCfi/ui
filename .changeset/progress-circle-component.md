---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Add `c-progress-circle`, a circular determinate progress indicator — the
circular counterpart of `c-progress-bar`.

- Props: `value` (0–100, clamped), `size` (diameter in px, default 32) and
  `width` (track thickness in px, default 6; the value arc draws at half
  this, inset within the track).
- Default slot for optional centered content (e.g. '57%' or an icon); nothing
  auto-renders in the center.
- Customization via `::part(root)` / `::part(track)` / `::part(bar)` /
  `::part(content)`; the arc strokes the primary role on a muted surface
  track.
- Exposes `role="progressbar"` with `aria-valuemin/max/now`; name it with
  `aria-label` on the element.
- Determinate-only by design: circular unknown-duration waiting remains
  `c-spinner`'s job.
