---
status: accepted
amends: ADR-0035 (its "hover/focus looks remain internal" consequence)
---

# 39. Selection-control focus ring joins the indicator's colour channel

The keyboard focus ring of `c-checkbox` and `c-radio` used to be an `outline`
on the part-less 42px ripple surface, hard-wired to `--c-primary` (or, on the
radio, the private group channel `--_c-radio-color`). A consumer following
ADR-0035's recipe (`c-radio:state(checked)::part(indicator) { color: green }`)
got a green control with a primary-blue focus ring, and no `::part()` could
reach it. We move the ring onto the **indicator** part as a `::before` halo
drawn with `currentColor`, and make the checkbox indicator draw its border and
checked fill from `currentColor` as well — so a single `color` on
`::part(indicator)` recolours box, dot and focus ring, with no new API.
Geometry is unchanged (a 2px ring: 44/40px outer/inner on the checkbox,
46/42px on the radio): the ripple spans move into their own clipped layer so
the surface no longer needs `overflow: hidden`, which would have clipped the
halo.

## Considered options

- **A public per-component custom property** (`--c-checkbox-color`, and
  promoting the radio's `--_c-radio-color`). One channel would also recolour
  the hover tint and the ripple, and it is trivial to implement — but it
  reintroduces exactly the per-component `--c-*` variable layer ADR-0004 and
  ADR-0006 removed, and every component would ask for one next. Rejected.
- **Using the `ring` semantic token** for the focus colour. A global knob: it
  does not follow the control's own colour, and it would be inconsistent
  unless every component's focus indicator migrated to it. Rejected.
- **Re-stamping a part on the ripple surface** so consumers can restyle the
  ring there. Reverses ADR-0035's "ripple is internal". Rejected.

## Consequences

- Hover tint and ripple stay internal on the primary (or group) channel: they
  live on the surface, an ancestor, which cannot inherit a child's colour. A
  recoloured control keeps its faint primary hover wash. This narrows
  ADR-0035's consequence to "hover looks remain internal".
- `c-switch` is deliberately excluded: its ring already sits on the public
  `slider` part, and its `color` channel carries the handle and spinner, not
  the track — a "follow the control colour" ring would need its recipe
  re-plumbed.
- `color` on `::part(indicator)` is the documented recolour channel. Rules
  that set only `background` / `border-color` still recolour the box, but the
  ring then keeps the internal colour.
- The checkbox indicator's disabled / error colours ride on one `text-*`
  utility; the separate error / disabled fill and ring rules in its
  escape-hatch `<style>` are gone.
