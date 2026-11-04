# Lighter buttons on dark popovers and menus (parked)

Parked during the outline and ghost grill (2026-11-04, `_plan/button-outline-ghost.md`, recorded in ADR-0079). Not
grilled yet.

## The failures

The lighter appearances (ghost, text, outlined) draw their label in `on-<role>-subtle`, which is step 200 in dark mode,
over a translucent wash of the fill (300 or 400). The wash reads against whatever is behind it. On the page surface
(slate-800) every label clears AA. On `surface-overlay` (slate-700, c-popover, c-menu and the pickers' panels) the
light label has less room:

| Variant | Text, no wash | Ghost /14 | Hovered /20 |
|---|---|---|---|
| primary | 5.20:1 | 4.29:1 | 3.95:1 |
| secondary | 4.35:1 | 3.86:1 | 3.63:1 |
| success | 6.74:1 | 5.45:1 | 4.93:1 |
| info | 5.95:1 | 5.07:1 | 4.66:1 |
| warning | 8.33:1 | 6.06:1 | 5.31:1 |
| danger | 5.55:1 | 5.09:1 | 4.89:1 |

- **Before the 2026-11-04 wash change** (/8 and /15), primary read 4.66:1 at rest and 4.23:1 hovered. Secondary failed
  in every state then too.
- **Light mode has one failure, on `surface-sunken`** (primary-100): success's ghost reads 4.13:1 at rest and 3.95:1
  hovered. Its text button passes there at 4.61:1.
- **The library's own lighter buttons on overlays** are text icon buttons in c-color-picker's panel. As icons they need
  3:1, which they meet. The exposure is app content: a ghost, text or outlined button in a c-popover or c-menu.
- **Nothing tests it:** the button-variant spec measures the page surface only.

## Candidate fixes

1. **A lighter dark tint ink:** dark `on-<role>-subtle` moves from 200 to 100.
   - Every lighter appearance then clears AA on every surface; the lowest is primary hovered on slate-700, 5.50:1.
   - Every dark tint's text gets paler too: alerts, highlighted rows, menus and the pickers' cells.
   - Primary-100 (#c4dee4) sits close to the body text, so a dark text button stops reading as coloured.
2. **A darker dark wash:** in dark mode, wash with a step darker than the surface instead of the fill. For example,
   900 at 30% reads 5.4:1 or better on slate-700 with the 200 ink.
   - It needs a mode-aware colour, a new token per role, because light mode still washes with the fill.
   - It changes the look from lighter to darker.
3. **A per-surface wash:** c-popover and c-menu set an inherited private property that thins the wash for their
   content.
   - It's cheap.
   - It can't fix secondary, which fails with no wash at all, and it misses apps' own overlay surfaces.
4. **A secondary-only ink step:** secondary's 200 is the weakest ink. Move only secondary's dark ink to 100, and pair it
   with fix 2 or 3 for primary.

The spec should then measure the lighter appearances on `surface-overlay` too.
