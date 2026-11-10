# 86. Progress bars draw their track and bar as plain elements

Date: 2026-11-10

## Status

Accepted. Lands in the release candidates, before `4.0.0`
(`_plan/progress-bar-recolour.md`).

## Context

A consumer could not recolour `c-progress-bar` via `::part()`, the only
customization API (ADR-0006). The bar was a native `<progress>`: its fill is
the engine's `::-webkit-progress-value` or `::-moz-progress-bar` (the latter a
rotated padding hack), on an element with no part. The `bar` part, documented
as "the visible track", was the `<label>` around it. The `<progress>` covered
its content box with its own `surface-muted`, and its 4px frame was a
`box-shadow`, so `::part(bar) { background-color }` changed nothing on screen.

3.x had `--c-progress-bar-color` and `--c-progress-bar-background-color`. The
migration guide sends per-component custom properties to `::part()`, and for
these two there was no part to send them to.

The sibling `c-progress-circle` names its ground `track` and its value arc
`bar`, so the two progress components used `bar` for opposite things.

## Decision

- **The progress track and the bar are plain elements.** The track carries
  `role="progressbar"` with `aria-valuemin`, `aria-valuemax` and, while
  determinate, `aria-valuenow`. The bar is its child, sized by `width`. An
  internal clip between them keeps the indeterminate sweep inside the inner
  pill. The role sits on the track, not the root: a progressbar's children are
  presentational, and the details line beside the bar must stay readable.
- **`track` and `bar` mean what they mean on `c-progress-circle`.** `track`
  is new, and **`bar` moves from the track to the fill** (and the sweep). This
  is the one exception to the release-candidate API freeze: the API guard sees
  only an added `track`, and the changeset tells an rc user to move a
  `::part(bar)` rule to `::part(track)`. Keeping `bar` on the track would have
  made 4.0.0 fix opposite meanings of `bar` on the two siblings for the whole
  4.x line.
- **The track owns the geometry.** The bar fills the track's content box, so
  `::part(track) { height }` sizes both and its `padding` is the frame around
  the bar. These replace 3.x's `--c-progress-bar-height` and
  `--c-progress-bar-border-width`.
- **Opaque tints, the same pixels.** The 3.x look painted the whole bar at
  `opacity: 0.75`, which would wash a consumer's colour too. The track paints
  `bg-tint-surface-muted/75` and the bar `bg-tint-primary/75`, each mixed into
  the ground it sits on (ADR-0082). That is what the see-through bar showed;
  a consumer's colour paints as written.
  - The track pins `--_c-tint-scale` to 1. A tinted container (an alert's
    message, a data table's banner and its selected and hovered rows) halves a
    tint's share so the labels on it keep AA; the bar carries no label.
  - At the half share, a bar in a neutral alert read 1.78:1 against its
    progress track (1.93:1 dark), under the 3:1 a graphic needs; at the full
    share it reads 3.53:1 (3.57:1), as the see-through bar did.
- **Forced colors keep the bar.** `<progress>` drew itself in a forced-colors
  mode; a plain background is forced to `Canvas`. There the bar paints
  `Highlight` and the track outlines in `CanvasText`.
- **The same holds for `c-file-upload`'s rows.** A row's `progress` part is its
  progress track; its bar, previously unreachable, is the `progress-bar` part.

## Considered options

- **Keep `<progress>` and paint the fill with `currentColor`**, so `color` on
  a part recolours the fill. A smaller change, but the fill's shape and
  transition stay out of reach, the Firefox hack stays, and two boxes still
  paint the ground.
- **Document chained pseudo-elements** (`::part(track)::-webkit-progress-value`).
  Vendor-specific, and the engines support pseudo-elements after `::part()`
  unevenly.
- **Keep `bar` on the track and add a `fill` part.** Purely additive, but the
  two progress components would disagree on `bar` forever.
- **Stamp `part="track bar"` on the track** for 4.x and drop `bar` in 5.0.
  Additive, but the fill could not be `bar` until 5.0, and a second rename
  would follow.
- **Paint the roles at full strength** (fill against track 5.7:1 light, 5.2:1
  dark, against 3.5:1 and 3.6:1 today). A visible colour change, left to its
  own decision with a rendered comparison.
- **Keep `opacity: 0.75` on the track.** Today's pixels, but every consumer
  colour would be mixed with whatever sits behind the bar.

## Consequences

- An rc consumer's `c-progress-bar::part(bar)` rule now styles the fill.
- No vendor pseudo-elements: Firefox and WebKit draw the bar Chromium draws.
- On a raised surface in dark mode the mix into `surface` differs slightly
  from the old see-through bar, as ADR-0082 accepts for every tint.
- The progress track still reads about 1.1:1 against the page, as before;
  raising it is a separate colour decision.
