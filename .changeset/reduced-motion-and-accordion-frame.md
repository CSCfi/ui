---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Honour the OS reduced-motion preference in every component, and make the
accordion frame the default c-accordion look.

- With `prefers-reduced-motion: reduce`, every component transition is
  instant. The dropdown, autocomplete and tree-select panels open in place,
  the loader message no longer rises, ripples are skipped and the tab strip
  arrows scroll instantly. Spinners, indeterminate progress and the toast
  timer keep moving because the motion carries meaning.
- Collapsed c-accordion items now stack flush into one hairline frame with
  rounded ends. An expanded item lifts out of it with a primary outline, a
  faint primary wash, an inset accent bar and 8px of space around it. The
  header is transparent, and the content sits in an inset card. Consumers who
  wrote this look as a `::part()` override can remove it.
- `outlined` now outlines expanded items only, thickening their outline to
  2px. It used to draw a ring inside every item, which reads as a double
  border in the frame.
- Fix c-accordion ignoring its initial `value` when its items are authored in
  HTML.
