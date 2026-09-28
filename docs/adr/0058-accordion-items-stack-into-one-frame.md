# 58. Accordion items stack into one frame, and an expanded item lifts out of it

Date: 2026-09-25

## Status

Accepted

## Context

Accordion items were separate tinted header pills with an 8px gap between
them. MyCSC restyled them through `::part()` into a single framed list: the
collapsed items share one hairline outline, and an expanded item becomes its
own outlined, lightly washed card with space around it. That override has now
become the design, so it belongs in the component, not in every consumer.

The override keyed its geometry on sibling selectors run from the light DOM:
`c-accordion-item[expanded] + c-accordion-item`,
`:has(+ [expanded])`, `:first-of-type` and `:last-of-type`. Inside the item's
shadow root the equivalents would be `:host(:is([expanded] + *))` and
`:host(:has(+ [expanded]))`. Chromium matches neither of them; only the
compound forms such as `:host(:first-of-type)` work.

## Decision

- **The frame is the default look.** `c-accordion` drops its gap. Every item
  root draws a 1px `border` edge without its top edge, so each shared edge is
  one line. The first item regains its top edge, and the ends of a collapsed
  run round off at 16px squircle corners (8px where `corner-shape` is
  unsupported, the `rounded-csc-*` convention).
- **An expanded item lifts out.** It gets a primary border, a 5% primary wash,
  16px corners, a 2px inset primary bar on its leading edge and 8px of margin
  above and below. The margin is dropped above a first item and between two
  expanded items. The item after it regains its top edge, and the items on
  either side round their facing corners. The margin transitions over 0.3s.
- **The header is transparent** at rest, with the ghost hover and active
  washes. The wash takes the root's corners and squircle shape, and on an
  expanded item only its top corners, so it never rounds off above the
  content card.
- **`outlined` outlines expanded items only**, adding a 1px primary ring
  inside the border for a 2px outline. It used to ring every item, which
  inside the frame's hairline read as a double border. The content is a raised card inset 8px, with 12px padding and a 25%
  primary inset hairline.
- **Each item works out its own place.** It reads its light-DOM siblings
  (first, last, after an expanded item, before one) and watches its parent
  with a `MutationObserver` for `expanded` flips and child changes. Nothing
  depends on `c-accordion`, so a hand-placed run of items frames itself.
- The part set is unchanged. Consumers still restyle through `::part(root)`,
  `::part(header)` and `::part(content)`, keyed on `[expanded]`.

## Consequences

- The earlier look (separate tinted pills with gaps) is gone. Consumers who
  wrote the MyCSC override can delete it; left in place, it paints the same
  result.
- While fixing the initial state for the visual baseline, `c-accordion` was
  found to ignore its initial `value` when the items were authored in HTML,
  because the items' `value` property is still undefined at the parent's
  mount. It now falls back to the `value` attribute.
