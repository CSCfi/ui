---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Redesign toasts as inverted-surface notifications: a borderless
contrast-flipping pill (near-black in light mode, white in dark mode) with
the status carried by a circular tinted icon badge, a neutral dismiss button
(new `badge` and `dismiss` CSS parts) and a neutral progress bar. Adds the
inverted-surface semantic tokens (`surface-inverted`,
`on-surface-inverted(-muted)` and the `*-inverted` status roles) to the
token set and the Tailwind theme export. Toast enter/exit motion now follows
the stack's placement (top-anchored stacks slide from the top edge) and
respects `prefers-reduced-motion` (cross-fade instead of a slide).
