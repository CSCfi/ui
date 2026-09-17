---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Fix the ink of content projected onto a surface that pins its own theme mode
(ADR-0053). A mode scope re-points the semantic tokens but paints nothing, so a
`color` resolved outside it inherits in as a literal: `<c-card
data-theme="light">` on a dark page flipped its background but left its slotted
body copy in dark-mode ink, near-invisible on the light surface.

Containers that paint a surface ladder rung and project consumer content now
declare the matching `on-` ink on that same box, so everything they project
re-resolves with the surface:

- `c-card` — `on-surface` on the `root` part (the `surface-raised` box). The
  card sections and their slotted content inherit it, and
  `c-card::part(root) { color }` stays the single lever for recolouring the
  whole card.
- `c-login-card` — `on-surface` on the `root` part (the `surface` box).
- `c-menu` — `on-surface` on the `list` part (the `surface-overlay` panel), for
  content slotted into a menu beside its `c-menu-item`s.

Under a pinned document mode nothing moves: the ink these boxes inherited was
already `on-surface`. The one intentional change is a `c-card` inside a
`c-modal`, whose body copy now renders the card's own `on-surface` instead of
the modal's `on-surface-muted` — matching a standalone card and the card title.
