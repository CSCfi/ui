# Selection-control focus ring follows the indicator colour

## Context

ADR-0035 made the checkbox box and the radio ring consumer-recolourable through
`::part(indicator)` + `:state()`. The focus-visible ring did not follow: in both
`c-checkbox` and `c-radio` it is painted on the **part-less 42px ripple surface**,
hardcoded to `var(--c-primary)` (checkbox; `--c-error` / `--c-border-strong` for
error / disabled) or to the private group channel `var(--_c-radio-color, var(--c-primary))`
(radio). A consumer who follows the usage.md recipe gets a green control with a
primary-blue focus ring, and `::part()` cannot reach the surface by design
(glossary: "ripple is internal"; ADR-0035: "hover/focus looks remain internal").

Request: make the focus-visible outline colour consumer-recolourable, following
the control's own colour. Note the glossary reserves *theming* for seed
re-branding (ADR-0011); the ring already follows the primary seed. This work is
about **consumer recolouring through the customization contract**.

### Decisions (grilling session, 2026-09-02)

1. **Channel = the indicator's `currentColor`.** The ring draws with the
   indicator part's colour, so the existing `::part(indicator) { color: … }`
   recipe recolours box/dot **and** ring with zero new API (fits ADR-0006/0035).
   Rejected: a public per-component custom property (would reverse the
   ADR-0004/0006 decision that dropped per-component `--c-*` variables); the
   unused `ring` semantic token (global knob, does not follow the control).
2. **Focus ring only.** Hover tint and ripple live on the ancestor surface and
   cannot inherit a child's colour; they stay on the internal primary/group
   channel. ADR-0035's sentence becomes "hover looks remain internal; the focus
   ring follows the indicator".
3. **`c-switch` out of scope.** Its ring already sits on the public `slider`
   part (`c-switch::part(slider) { outline-color }` works today), and its
   `color` channel carries the handle/spinner, not the track, so "follow the
   control colour" would require re-plumbing its recipe. Recorded, not an
   oversight.
4. **Geometry pixel-identical.** The ring becomes a `::before` halo on the
   indicator (2px border; `inset: -15px` on the checkbox, whose 2px border shrinks
   the padding box the pseudo is placed from, `-13px` on the radio → checkbox
   40–44px, radio 42–46px, exactly today's values). The ripple surface loses `overflow-hidden`; ripple
   spans move into a dedicated clipped layer so the halo is not clipped.
5. **New ADR-0039** + amendment note in ADR-0035; glossary gains a *Focus ring*
   entry and two flagged ambiguities (*ring*, *themeable*).

## Implementation

### 1. `packages/csc-ui/src/components/c-checkbox/CCheckbox.vue`

Template (lines ~27–58):
- Inside the ripple surface span (`ref="rippleContainerRef"`, class
  `c-checkbox__ripple`), wrap the `v-for` ripple spans in a new
  `<span :class="ui.rippleLayer()" aria-hidden="true">` placed **before** the
  indicator span. Keep `rippleContainerRef` on the surface (same rect, `useRipple`
  measures `getBoundingClientRect()` only).

tv config (lines ~183–271):
- `ripple` slot: remove `overflow-hidden`.
- New slot `rippleLayer: 'pointer-events-none absolute inset-0 rounded-full overflow-hidden'`.
- `indicator` slot becomes (geometry unchanged; `text-primary` is the default
  channel, `color` joins the transition list because a `currentColor` border
  no longer animates by itself; no opacity transition on the halo, today's
  outline appears instantly):
  `"absolute top-3 left-3 h-[18px] w-[18px] rounded-csc-sm border-2 border-current bg-transparent text-primary transition-[color,background-color,border-color] duration-200 ease-out before:content-[''] before:pointer-events-none before:absolute before:-inset-[15px] before:rounded-full before:border-2 before:border-current before:opacity-0"`
  (14px padding box + 2×15px = 44px outer, 2px border → 40px inner = today's ring.
  `before:content-['']` is mandatory: `@property` defaults don't register from
  adopted sheets. Leading-dash negative idiom matches the repo's `-top-0.5`.)
- `variants.disabled.false.indicator`: delete (`{}`), the base slot carries `text-primary`.
- `variants.disabled.true.indicator`: `'border-border-strong'` → `'text-border-strong'`
  (tailwind-merge resolves the text-colour group; the variant wins over the base).
- compound `error && !disabled`: `indicator: 'border-error'` → `indicator: 'text-error'`
  (keep `rippleEffect: 'bg-error'`, `root: 'text-error'`).

Escape-hatch `<style>` (lines ~499–582):
- Checked/indeterminate fill: `background-color: var(--c-primary); border-color: var(--c-primary)`
  → `background-color: currentColor;` (border is already `border-current`).
- **Delete** (now covered by `currentColor`): the `.c-checkbox--error … .c-checkbox__box`
  fill rule, the `.c-checkbox--disabled … .c-checkbox__box` fill rule, the three
  ring rules on `.c-checkbox__ripple` (`input:focus-visible + label …`, error,
  disabled).
- **Add**: `input:focus-visible + label .c-checkbox__box::before { opacity: 1; }`
  (sibling-driven reveal, ADR-0007 allowlist: depends on live `:focus-visible`
  of the sibling input).
- Keep: hover wash on `.c-checkbox__ripple`, disabled hover suppression,
  `.c-checkbox__path` rules, message transition.
- Update the comment blocks: tv header (~163–182), escape-hatch preamble
  (~480–498), the `rippleEffect` clipping remark, and the stale line ~521
  comment that still mentions a `before:border-*` variant. Message: the
  indicator has one colour channel (`text-*` utility internally, consumer
  `color` externally) driving border, fill and focus ring.

Docblock `@csspart indicator` (line ~117): "The checkbox box — border, checked
fill and its focus ring (its `::before`) all draw with `currentColor`, so
`color` recolours them together".

### 2. `packages/csc-ui/src/components/c-radio/CRadio.vue`

Reminder: `.c-radio__indicator` is the **surface**; `.c-radio__selection`
(`part="indicator"`) is the indicator part.

Template (lines 11–25): wrap the `v-for` ripple spans in
`<span :class="ui.rippleLayer()" aria-hidden="true">` before `.c-radio__selection`.
Keep `surfaceRef` on the surface.

tv config (lines 86–116):
- `surface` slot: remove `overflow-hidden`.
- New slot `rippleLayer` (same string as checkbox).
- `indicator` slot: append
  `before:content-[''] before:pointer-events-none before:absolute before:-inset-[13px] before:rounded-full before:border-2 before:border-current before:opacity-0`
  (20px ring + 2×13px = 46px outer / 42px inner = today's ring). No `text-*`
  on it: it keeps inheriting `var(--_c-radio-color, var(--c-primary))` from the
  surface. The existing `after:` dot utilities stay untouched.

Escape-hatch `<style>` (lines 221–267):
- Replace `input:focus-visible ~ .c-radio__indicator { outline: 2px solid var(--_c-radio-color, var(--c-primary)); }`
  with `input:focus-visible ~ .c-radio__indicator .c-radio__selection::before { opacity: 1; }`.
- Keep `input:focus { outline: none; }`, the surface colour chain, hover wash,
  disabled rules. Update the comment block (lines 202–220) accordingly.

Docblock `@csspart indicator` (line 35): add "…and its focus ring (its `::before`)".

### 3. `c-radio-group` — no code change

The group still writes `--_c-radio-color` for error/disabled; the surface sets
`color` from it and the indicator inherits, so the ring follows automatically.
Verify visually (step V3).

### 4. Docs: `usage.md` Customization sections

`c-checkbox/usage.md`: lead with the one-channel recipe, keep the finer-grained
rules as the second example:

```css
/* Border, checked fill and the focus ring all follow `color`. */
c-checkbox::part(indicator) { color: var(--my-green); }
c-checkbox:state(checked)::part(mark) { color: black; }

/* Finer control still works per property and per state: */
c-checkbox:not(:state(checked))::part(indicator) { border-color: gray; }
```

`c-radio/usage.md`: extend the sentence "Ring and dot both draw with
`currentColor`" to "Ring, dot and the focus ring all draw with `currentColor`".
Both keep the closing "prefer the design tokens (`--c-primary` seed)" note.

### 5. `docs/adr/0039-focus-ring-follows-indicator-colour.md` (new)

Short ADR, format per `.claude/skills/grill-with-docs/ADR-FORMAT.md`:
- Title: "Selection-control focus ring joins the indicator's colour channel".
- Summary: ring moves from the part-less surface onto the indicator as a
  `::before` halo drawn with `currentColor`; the checkbox indicator switches to
  `currentColor` drawing (border/fill), so one `color` on `::part(indicator)`
  recolours box, dot and ring. Hover tint and ripple stay internal. Geometry
  preserved by re-parenting ripples into a clipped layer.
- Considered options (worth remembering): public per-component custom property
  (`--c-checkbox-color`, promoting `--_c-radio-color`) — covers hover/ripple
  too but reverses ADR-0004/0006's removal of per-component `--c-*` variables;
  the `ring` semantic token — global, does not follow the control; re-stamping
  a part on the surface — contradicts ADR-0035.
- Consequences: `c-switch` deliberately excluded (ring already on `slider`,
  `color` is its handle channel); consumer rules on `::part(indicator)` that
  set only `background`/`border-color` still recolour the box but leave the ring
  on the internal colour — `color` is the documented channel. Amends ADR-0035.

`docs/adr/0035-…md`: frontmatter `status: accepted — amended by ADR-0039 (focus
ring)`; consequence line 96 → "hover looks remain internal; the focus ring
follows the indicator's colour (ADR-0039)".

### 6. `CONTEXT.md`

Under `### Styling`, after **Mark**:

> **Focus ring** (selection controls):
> The 2px keyboard-focus halo around a selection control's indicator, drawn by
> the **indicator**'s own `::before` with `currentColor`, so it always matches
> the indicator's colour — including a consumer's `::part(indicator) { color }`
> (ADR-0039). Circular and 42px-scale like the ripple surface it visually
> encloses, but it is the indicator's, not the surface's. Not a **part**.
> _Avoid_: Outline (the CSS property, not the concept), `ring` (the semantic
> token role / the radio indicator's shape), focus outline

Under `### Flagged ambiguities`:

> - **"Ring"** is overloaded: (a) the `ring` **semantic token** (the focus
>   colour role — currently used by no component), (b) the radio indicator's
>   shape, (c) Tailwind `ring-*` box-shadow utilities, (d) the keyboard
>   **focus ring**. Say **"`ring` token"**, **"radio indicator"**, **"`ring-*`
>   utility"** and **"focus ring"** respectively.
> - **"Themeable"** (docs copy: "themable") means *re-seedable* — one of the
>   eight **families** (ADR-0011). Consumer restyling of one component's
>   colours is **"recolour via `::part()`"**, never "theming".

### 7. Changeset `.changeset/selection-control-focus-ring.md`

New file, `minor` for `@cscfi/csc-ui` and `@cscfi/csc-ui-react` (fixed group).
(The ADR-0035 changeset `selection-control-state-styling.md` is still
unreleased, but a separate entry keeps the ADR-0039 reference findable.) Wording:
the focus ring of `c-checkbox` / `c-radio` now follows the indicator colour, so
`c-checkbox::part(indicator) { color: green }` recolours border, fill and focus
ring together (ADR-0039); hover tint unchanged; no geometry change; `c-switch`
unchanged.

### Out of scope, noticed en route (not part of this change)

- `c-switch` ring stays `var(--c-primary)` on the `slider` part (decision 3).
- The `ring` semantic token is defined, contrast-audited and documented as
  "Keyboard focus ring" but used by zero components; every focus indicator in
  the library authors `primary`/`error`/… directly.
- Docs token table `app/content/customization.ts` line ~371 lists `ring` dark as
  `accent-400`; the token has been `primary-300` since ADR-0034.

## Mechanics verified during planning (do not re-derive)

- **Paint order**: the checkbox surface's `transform-gpu` makes it a stacking
  context; inside it the hover wash paints first, then z-auto positioned
  descendants in tree order: ripple layer → indicator → its `::before` → the
  `z-[1]` svg (14px, never overlaps a ring 13px outside the box). Transform does
  not clip, so the 1–2px overhang renders like today's outline. Radio: same by
  tree order.
- **Cascade**: an outer-tree normal declaration (`::part(indicator) { color }`)
  beats the shadow sheet's `text-primary` regardless of specificity; the
  `::before` inherits that `color`, `border-current` resolves against it. The
  old `background`/`border-color` recipe still recolours the box; ring then
  stays on the internal colour (accepted).
- **Ripple coordinates**: `useRipple` positions spans against the surface rect;
  the layer is `inset-0` of the surface, so nothing changes.
- **Dead code**: the disabled focus rules never matched (disabled inputs are
  unfocusable); deleting them is safe.
- **Forced colours**: no `forced-colors` handling exists in the repo; a border
  ring is forced to `CanvasText` on focus exactly as the outline was.
- **Manifest**: the analyzer lint checks only name symmetry; description-only
  docblock edits need nothing beyond the regenerate that `build` already runs.

## Verification

- **V1 Build + lints** in `packages/csc-ui`: `pnpm build` (tokens → tag map →
  vite → vue-tsc → strict manifest; `custom-elements.json` must list the same
  parts/states, with the updated `indicator` descriptions), then
  `pnpm lint:tokens -- --strict`, `pnpm lint:a11y`, `pnpm lint:contrast`.
  Then `pnpm --filter @cscfi/csc-ui-react build` (description-only regen).
- **V2 First-build Tailwind scan**: grep `dist/csc-ui.js` for
  `inset:calc(13px * -1)` (or `-inset-\[13px\]`) and `.border-current`; a
  first build after adding utilities has silently omitted them before, so rerun
  `vite build` if missing.
- **V3 Visual parity** (memory `project_csc_ui_next_visual_verify`): static
  demo in the scratchpad served over HTTP (`cd / && python3 -m http.server 8099 --bind 127.0.0.1 &`),
  loading `…/dist/styles/css/tokens.css` and `…/dist/csc-ui.js` as a module
  that calls `defineCustomElements()`. Drive with playwright-core
  (`/workspace/node_modules/.pnpm/playwright-core@<ver>/node_modules/playwright-core/index.js`,
  CommonJS default import, `executablePath: '/ms-playwright/chromium-1223/chrome-linux/chrome'`),
  one context per `colorScheme` light/dark, `deviceScaleFactor: 2`,
  `waitForTimeout(1500)` after load. Trigger `:focus-visible` with
  `page.keyboard.press('Tab')` (never script `.focus()`), wait 400ms (colour
  transitions), screenshot. Assert in `page.evaluate`:
  `getComputedStyle(box, '::before').opacity === '1'` and its `borderColor`
  equals the indicator's computed `color`.
  Demo contents: checkbox default / checked / indeterminate / error / disabled;
  radio standalone + `c-radio-group` default / error (ring red) / disabled (no
  ring, no hover wash); a consumer-recoloured pair
  (`::part(indicator) { color: green }` → green ring) and one with the old
  `background`/`border-color` recipe (box recoloured, ring primary).
- **V4 Pixel parity**: capture the same demo from a pre-change build (`git stash`
  or a worktree on `development`) and diff row-wise; ring outer/inner diameters
  must be 44/40 (checkbox) and 46/42 (radio). Click a control mid-animation to
  confirm the ripple is still clipped to the circle.
- **V5 Docs site**: `pnpm dev`, open `/components/c-checkbox` and
  `/components/c-radio`; examples render, Tab shows the ring, the usage.md
  recipes render.

## Execution notes (2026-09-02)

- Implemented as planned, with one correction found by the pixel diff: the
  checkbox halo needs `before:-inset-[15px]`, not 13px — an absolutely
  positioned pseudo is placed from the parent's **padding box**, and the
  checkbox box has a 2px border (the radio ring is an inset shadow, so 13px is
  right there). With 15px both rings are pixel-identical to the old outlines
  (old-vs-new full-page diff at DPR 2: zero differing pixels on any focused
  default/checked/indeterminate/error checkbox or radio; the only differences
  are the intended green box/ring on the `::part(indicator) { color }` demo
  row and ~22 low-Δ anti-aliasing pixels on the error group's red glyphs).
- Verified via playwright-core + headless chromium-1223: `:focus-visible` on
  every Tab stop, halo `border-color` == indicator `color` in light and dark,
  green recipe → green ring (old bundle: primary), error group → red ring,
  disabled group unfocusable, mouse click → no ring, hover wash still primary,
  ripple still clipped to the 42px circle mid-animation.
- `pnpm build` (vue-tsc + strict manifest), `lint:tokens --strict`, `lint:a11y`,
  eslint and prettier all pass; `lint:contrast` reports 10 pre-existing text
  pairs below AA (token files untouched). React wrappers regenerated.
- Not run: the live Nuxt docs site (V5). The `dist/docs/*/usage.md` copies carry
  the new Customization text; the docs pages render those.
- Harness gotcha: `git stash` is unusable in this sandbox (silent failure); the
  baseline was built by swapping in `git show HEAD:` copies of the two SFCs.
