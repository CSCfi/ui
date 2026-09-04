---
status: accepted
---

# Load-bearing hairlines paint the `divider` ink

`c-button-group` and `c-tab-buttons` drew their frame purely with the opaque
`surface-sunken` fill of the track. That fill is the `c-main` canvas colour
(1.00:1 there), sits at 1.23:1 / 1.03:1 on `surface-muted` (light / dark) and
at 1.11:1 on the dark card surface — the control vanished on exactly the
surfaces a page is made of. We keep the fill opaque and move the boundary to
a 1px hairline painted with the translucent `divider` role, composited over
the parent surface. This amends ADR-0036's role split: `border` remains the
edge for frames that have another cue, `divider` is the ink for a
**load-bearing hairline** — an edge that is the only boundary cue.

## Context

- The frame was the fill: the track's padding showed the fill around the
  buttons, and nothing else marked the boundary. `surface-sunken` was in no
  `audit-contrast.mjs` pair and no docs example placed either control off the
  card surface, so the collision shipped unnoticed.
- The obvious fix — a **semi-transparent fill** that darkens or lightens
  whatever it sits on — was measured and rejected. The unselected buttons are
  `primary` text sitting directly on the track; an opaque fill keeps their
  ground constant (4.64:1 light, 5.32:1 dark on every surface). A translucent
  fill couples that ground to the parent rung:

  | track                      | label on card | on `surface-muted` | on canvas   |
  | -------------------------- | ------------- | ------------------ | ----------- |
  | today, opaque              | 4.64 / 5.32   | same               | same        |
  | black @ 15 % wash (light)  | 4.63          | 4.07 ✗             | 3.33 ✗      |
  | white @ 6–15 % wash (dark) | 2.96–3.99 ✗   | 3.20–4.30 ✗        | 3.30–4.44 ✗ |

  Any lightening wash in dark fails the label everywhere; any darkening on
  the light canvas fails it there. No single _opaque_ value reads against
  both white and the teal canvas either, so no fill alone can solve the
  canvas case.

- A hairline over the parent has the property the fill lacks: ADR-0036
  already established that one translucent ink reads on every surface-ladder
  rung, and the audit composites it. Measured over the parent: 1.31–1.32:1
  light, 1.43–1.47:1 dark on every rung, including the canvas.

## Decisions

- **The fill stays opaque** (`surface-sunken`; `surface-muted` when
  disabled). It is what keeps the labels' ground constant. Its job is the
  well and the gap around an active pill, not the boundary.
- **The boundary is a 1px `divider` border clipped out of the background**
  (`border border-divider` with `background-clip: padding-box`). The clip is
  essential: composited over the dark _fill_ the hairline is `#3e4144`,
  identical to `surface-overlay` (1.00:1 for a tab strip in a modal);
  composited over the _parent_ it is the audited `divider / <rung>` pair.
- **Geometry is preserved.** The track padding shrinks from 4 px to 3 px
  (small: 2 px to 1 px) so the hairline replaces padding and the group stays
  44 px, level beside a `c-text-field` as documented. In `c-tab-buttons` the
  adapter's track carries the border; its `::part(root)` rule additionally
  sets `border-color: transparent; margin: -1px` on the wrapped group so the
  group's border box coincides with the track's, the buttons land where a
  standalone group puts them, and the pill offsets (3 px / 1 px, translateX
  minus `clientLeft`) follow.
- **ADR-0036's split is amended.** `border` remains the role for frames that
  have another cue — a card's shadow, an edge on a fill that already reads
  (`c-card`, `c-toolbar`, `c-input` are unchanged). `divider` is the ink for a
  load-bearing hairline: an edge that is the only thing separating a
  component from its parent and must therefore read on every rung.
- **The audit gains the pairs this design leans on:** `divider /
surface-sunken` (the canvas rung was missing from the hairline loop) and
  `primary / surface-sunken` as text (the label on the track).

## Considered alternatives

- **Translucent fill as a new `track` token** (black/white @ 15 %) — reads
  on every rung, but fails the unselected label's AA as measured above.
  Rejected.
- **Translucent fill + relabel the unselected buttons with
  `on-surface-sunken`** — passes AA, but needs a new private c-button hook,
  turns dark labels near-white instead of teal, and a lightening well in dark
  reads as raised under the elevation model. Rejected.
- **`border` as the frame ink** — keeps ADR-0036 untouched, but 1.15:1 on
  light `surface-muted`, 1.07:1 on the light canvas, 1.00:1 in dark overlays:
  it fails exactly where the bug was reported. Rejected.
- **`border-strong`** — clears 3:1 almost everywhere, but is the text-field
  outline weight and turns the quiet well into an outlined control; still
  2.83:1 in dark overlays. Rejected.
- **Outside ring (`ring-1 ring-divider`)** — composites over the parent with
  no geometry code, but adds 1 px each side so the group reads 46 px beside a
  44 px field. Rejected.

## Consequences

- Both components' `root` part now carries a border; consumers overriding
  `background` via `::part(root)` are unaffected, consumers who want a
  frameless well set `border-color: transparent`.
- CONTEXT.md gains **Track** and **Load-bearing hairline**, and no longer
  describes `divider` as separator-only.
- Light mode keeps the pale-teal (`primary-100`) track identity; only the
  boundary changes.
- The docs gain an on-canvas example for `c-button-group`, a permanent
  visual check for the case that was broken.
