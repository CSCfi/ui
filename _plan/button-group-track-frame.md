# Button-group / tab-buttons track must read on every surface

> On execution, copy this file to `_plan/button-group-track-frame.md` (repo convention for plans).
> CONTEXT.md and ADR edits below are recorded here because plan mode blocked writes; apply them first.

## Context

`c-button-group` and `c-tab-buttons` draw their frame **entirely with the opaque `surface-sunken`
fill** of the track (the `root` part; `CButtonGroup.vue:123-129`). Whether the control is visible
therefore depends on how far that fill sits from the parent surface:

| Fill vs parent | light | dark |
|---|---|---|
| card (`surface` / `surface-raised`) | 1.41:1 | 1.11:1 |
| `surface-muted` (the reported case) | 1.23:1 | 1.03:1 |
| page canvas (`c-main` paints the same `surface-sunken`) | 1.00:1 | 1.00:1 |
| disabled fill `surface-muted` on `surface-muted` | 1.00:1 | 1.00:1 |

Nothing audited `surface-sunken`, and no docs example shows either control off the card surface.

### Finding that shaped the fix

The user's hypothesis was a semi-transparent fill. It was checked and rejected: the unselected
buttons are `text-primary` sitting directly on the track, so a translucent fill couples their
ground to the parent rung. Measured (label needs 4.5:1):

| Track | label on card | on `surface-muted` | on canvas |
|---|---|---|---|
| today, opaque | 4.64 light / 5.32 dark | same | same |
| black 15% wash (light) | 4.63 | 4.07 ✗ | 3.33 ✗ |
| white 6–15% wash (dark) | 2.96–3.99 ✗ | 3.20–4.30 ✗ | 3.30–4.44 ✗ |

Any lightening wash in dark fails the label everywhere; any darkening on the light canvas fails it
there; and no single *opaque* value reads against both white and the teal canvas. So the opaque
fill is a feature (constant label ground) and the missing piece is a **boundary that reads on every
rung**. Unselected buttons are transparent, so there are no dividers between them; the gap only
shows around an active pill, which any opaque fill preserves.

## Decisions

1. **Opaque fill + translucent hairline frame.** Fill unchanged (`surface-sunken`, disabled
   `surface-muted`). A 1px hairline composited over the *parent* provides the boundary.
   Rejected: translucent fill (label AA), translucent fill + relabel with `on-surface-sunken`
   (new c-button hook, near-white dark labels), frame-only transparent track (3.5:1 labels in
   dark overlays), retuning `surface-sunken` (`c-main` shares it).
2. **Frame ink is `divider`** (black/white @ 12%): over the parent it reads 1.31–1.32 light and
   1.43–1.47 dark on every rung. `border` fails at 1.15 (light muted), 1.07 (light canvas), 1.00
   (dark overlay); `border-strong` is text-field-outline weight and still 2.83 in dark overlays.
   This amends ADR-0036's split: `border` stays the edge for frames with another cue (card shadow,
   a fill that already reads); `divider` is the ink for a **load-bearing hairline**, an edge that is
   the only boundary cue. Recorded as ADR-0042.
3. **Drawn as a border inside the box**: `border border-solid border-divider bg-clip-padding`.
   `bg-clip-padding` is essential: over the dark fill the hairline is #3e4144, identical to
   `surface-overlay`. Padding trimmed 4px → 3px (small 2px → 1px) so the group stays exactly 44px
   and level beside a `c-text-field` (documented intent, `CButtonGroup.vue:135-138`). Tailwind 4.3
   emits `p-0.75` / `p-0.25` (verified: `calc(var(--spacing) * 0.75)`). Rejected: outside ring
   (`ring-1 ring-divider`) because it reads 46px beside a 44px field.
4. **Disabled state**: same frame, fill `surface-muted`. The hairline is what keeps a disabled group
   visible on a muted parent; disabled labels (`on-surface-faint`) are AA-exempt.
5. **Audit** gains the two pairs this design leans on: `divider / surface-sunken` (canvas rung was
   missing from the hairline loop) and `primary / surface-sunken` as TEXT (4.64 / 5.32).
6. **Glossary** (all accepted): sharpen the "segmented control" avoid-note; add **Track** and
   **Load-bearing hairline**; name `surface-muted` / `surface-sunken` in **Surface ladder**.
7. **Docs**: one canvas example for `c-button-group` (`on-canvas.vue` + three flavor variants).
   None for `c-tab-buttons` (folded into `c-tabs`; rarely on the bare canvas).

## Implementation

### `packages/csc-ui/src/components/c-button-group/CButtonGroup.vue`

- `root` slot (line 159):
  `'grid grid-flow-col auto-cols-fr rounded-csc-lg border border-solid border-divider bg-clip-padding bg-surface-sunken'`
- `sizeVariants` (lines 133-144): default `'p-0.75 gap-1 [--_c-button-min-height:2.25rem]'`,
  small `'p-0.25 gap-0.5'`. Update the height comment: 1px hairline + 3px padding + 36px = 44px.
- Rewrite the docblock at lines 123-129: the fill paints the well and the gap around an active
  pill; the boundary is a load-bearing hairline in `divider` clipped to the padding box so it
  composites over the parent (ADR-0042). Mention why the fill stays opaque (label ground).
- Comment at line 309-311 ("sunken track") stays valid.

### `packages/csc-ui/src/components/c-tab-buttons/CTabButtons.vue`

- `track` slot (line 129):
  `'relative isolate rounded-csc-lg border border-solid border-divider bg-clip-padding bg-surface-sunken'`
- `sizeVariants.indicator` (lines 105-114): default `'top-0.75 bottom-0.75'`, small
  `'top-0.25 bottom-0.25'` (buttons sit 3px / 1px inside the track's padding box).
- `moveIndicator` (line 223): `translateX(${box.left - trackBox.left - track.clientLeft}px)` —
  absolute children are placed from the padding box; `trackBox` is the border box.
- `<style>` rule (lines 342-344): add `border-color: transparent; margin: -1px;` so the wrapped
  group's border box coincides with the track's (the group keeps its 1px border + 3px padding, so
  button geometry is identical to a standalone group and the track's own border paints the
  hairline). Extend the comment accordingly.
- Header docblock (lines 91-94): the track draws the fill **and** the hairline; the inner group's
  box is made transparent and its own frame neutralised via `::part(root)`.

### `packages/csc-ui/scripts/audit-contrast.mjs`

- Hairline loop (lines 194-201): add `'surface-sunken'` to the rung list.
- After line 191: `add('primary', 'surface-sunken', TEXT, 'primary / surface-sunken (button-group label on track)');`

### Records

- **`docs/adr/0042-load-bearing-hairlines-paint-the-divider-ink.md`** (status: accepted). Content:
  the context table above; the label-contrast finding that killed the translucent fill; the
  decision (opaque fill + `divider` hairline via `border` + `bg-clip-padding`, padding trimmed to
  keep 44px); the ADR-0036 amendment defining *load-bearing hairline* and keeping `c-card`,
  `c-toolbar`, `c-input` on `border` / `border-strong`; considered: `border`, `border-strong`, a
  translucent `track` token, outside ring; consequences: adapter `::part(root)` neutralises the
  group's frame, audit pairs added, CONTEXT.md no longer describes `divider` as separator-only.
- **`CONTEXT.md`**:
  - *Button group* `_Avoid_`: split "toggle group / segmented control (foreign vocabulary for this
    same component)" into "toggle group (foreign vocabulary for this same component), segmented
    control as the component's *name* (fine as a description of its shape — the usage doc's
    'a button group is a segmented control' — never as a synonym in API names or headings)".
  - New **Track** (`c-button-group`, `c-tab-buttons`), after *Sliding indicator*: "The recessed
    ground a control's choices sit on — the framed well the buttons of a **button group** or **tab
    buttons** sit in, stamped as that component's `root` part. It paints an opaque fill, so the
    labels on it keep one ground wherever the control is placed, and a **load-bearing hairline**,
    so its boundary reads on every **surface ladder** rung. In a tab strip the **sliding
    indicator** glides inside it." `_Avoid_`: Well, rail, background, box.
  - New **Load-bearing hairline**, under *Theming & dark mode* after *Surface ladder*: "A 1px edge
    that is the *only* cue separating a component from what it sits on — no shadow, no fill that
    already reads. It paints the translucent `divider` ink over the parent surface, the one ink
    audited to read on every **surface ladder** rung (ADR-0036, ADR-0042); an edge with another
    cue (a card's shadow) stays on the opaque `border` role. The **track**'s frame is one; a card's
    border is not." `_Avoid_`: Border (the opaque role), outline (CSS property / focus concept),
    divider (the token, not this use of it).
  - *Surface ladder*: drop "four", and add: "Below `surface` sit two recessed rungs —
    `surface-muted` (subdued in-component fills: disabled controls, progress tracks) and, lowest,
    `surface-sunken` (the page canvas `c-main` paints, and the **track** fill) — each with its
    `on-` token."
  - *Separator*: "the token role deliberately takes the tag's name" stays; append "and, since
    ADR-0042, also paints every **load-bearing hairline**".
- **`.changeset/button-group-track-frame.md`** (`@cscfi/csc-ui` + `@cscfi/csc-ui-react`: patch):
  the two controls now read on every surface; the track keeps its fill and gains a 1px `divider`
  hairline; height unchanged (frame replaces 1px of inner padding); `::part(root)` now carries a
  border.
- **`packages/csc-ui/src/components/c-button-group/usage.md`**: short "## Placement" section —
  the track keeps an opaque fill for its labels and a hairline frame that reads on any surface;
  place it on a card, a muted panel or the page canvas with no extra styling.
- **`packages/csc-ui-documentation/app/content/customization.ts`**: in "Border & focus", fix
  `border`'s purpose ("Opaque edges for frames that have another cue: card frames, toolbar edge,
  table grid lines.") and add a `divider` row (light "black @ 12%", dark "white @ 12%", purpose
  "Translucent hairline ink: separators and load-bearing control frames; reads on every
  surface."). Check `pages/customization.vue:85-110` first: if the light/dark cells build
  `var(--c-<step>)` swatches from those strings, give the row the token itself.
- **Docs example** `packages/csc-ui-documentation/app/examples/c-button-group/on-canvas.vue`:
  first line `<docs>surface: canvas</docs>`; a labelled two-button group with `v-model` and an
  explicit `import { ref } from 'vue'`. Variants mirroring `basic.*`: `on-canvas.react.tsx`,
  `on-canvas.angular.ts`, `on-canvas.typescript.html` (no `.typescript.ts`: nothing to wire).

## Verification

1. `pnpm ui lint:tokens` → still "all SFCs are semantic-only". `pnpm ui lint:contrast` → new lines
   `divider / surface-sunken (hairline)` ≈ 1.31 light / 1.46 dark and `primary / surface-sunken`
   ≈ 4.64 / 5.32, both ✓; the 10 pre-existing light text failures are unchanged and not ours.
2. `pnpm ui build` (tokens → vite → types → strict manifest). Then confirm the Tailwind scan
   picked up the new utilities: grep `dist/csc-ui.js` (or the emitted CSS) for `border-divider`,
   `bg-clip-padding`, `p-0\.75`, `top-0\.75`, `p-0\.25`. A miss means rebuild (known first-build
   scan gap).
3. Visual check with the headless-chromium recipe (serve `/` over HTTP, load
   `dist/styles/css/tokens.css` + the ESM bundle and call `defineCustomElements()`, one page per
   `data-theme`). Page: three panels painted `var(--c-surface-raised)`, `var(--c-surface-muted)`,
   `var(--c-surface-sunken)`, each holding a `c-button-group` with a selection, a disabled one,
   and a `c-tabs` + `c-tab-buttons`. Assert with playwright-core (`executablePath` chromium-1223,
   wait > 400ms for colour transitions): frame visible on all nine cells in both modes; group
   `root` height 44px (small 40px); in tabs, the indicator rect equals the active button's native
   control rect (x within 0.5px); no double frame around the wrapped group; disabled group still
   framed on the muted panel.
4. Docs: `pnpm --filter @cscfi/csc-ui-documentation lint:examples` (parity) and `lint`; open the
   c-button-group page in `pnpm dev` and eyeball "On canvas" in light and dark.
5. `ls .changeset/button-group-track-frame.md` — CI requires an *added* changeset.

## Out of scope, noted for follow-up

- Audit gaps left as-is: `on-surface(-muted) / surface-sunken` text pairs (light 2.6:1 today).
- `customization.ts` drift beyond the two rows touched: `ring` dark listed as `accent-400` (is
  `primary-300`), ROLE_SEXTET note stale, `*-inverted` tier absent.
- ADR-0010 still documents `*-subtle` as step 200/100 (light.json uses 100/50).
- `lint:tokens` / `lint:contrast` run in no CI workflow despite "CI-guarded" wording.
