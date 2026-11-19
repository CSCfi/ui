Status: done, unpushed (2026-11-10). A 6761e141, B a8217a9d (rewritten 2026-11-11 to fold the follow-up into A). c-file-upload has no usage.md Customization section, so B added none; its parts table comes from the manifest.
Follow-up (2026-11-11, folded into A): the track pins `--_c-tint-scale:1`, since a tinted container (c-alert message, c-data-table banner and selected or hovered rows) halved the bar to 37.5% primary, 1.78:1 against the track. Spec + in-an-alert baselines; pixel parity with the old <progress> in an alert is AA-only.

# c-progress-bar: recolour the progress track and bar via `::part()`

First execution step: copy this plan to `_plan/progress-bar-recolour.md` (repo convention). Then apply the glossary
and ADR text below. The grilling ran in plan mode, so CONTEXT.md and `docs/adr/` could not be edited inline.

## Context

A consumer can't restyle c-progress-bar's track or fill with `::part()`:
- **The fill** is the native `<progress>`'s `::-webkit-progress-value` / `::-moz-progress-bar`, and the element has no
  part.
- **The documented `bar` part** ("the visible track", the `<label>`) paints nothing you can see. `<progress>` covers
  its content box with its own `surface-muted`, and its 4px frame is a `box-shadow` in `surface-muted`.

3.x had `--c-progress-bar-color` and `--c-progress-bar-background-color`. The migration guide sends 3.x users to
`::part()`, but no part reaches these regions, so there is no migration path. In CONTEXT.md terms this is
**"recolour via `::part()`"**, not theming: the colours already follow a re-seed and dark mode.

## Decisions (grilled 2026-11-10)

1. **Scope:** the progress track (with its frame), the determinate fill and the indeterminate sweep. This is 3.x
   parity.
2. **Plain elements, not `<progress>`.** The track element carries `role="progressbar"` with aria-valuenow/min/max,
   and the bar is a child element. This matches c-progress-circle and c-file-upload. The vendor pseudo-elements and the
   rotated Firefox hack go away.
3. **Names match c-progress-circle:** `track` is the ground and **`bar` moves to the fill**. This is a deliberate
   exception to the rc freeze. The API guard sees only an added `track`, so the changeset and the ADR must spell out
   the move.
4. **Opaque, same pixels.** Drop `opacity-75`. The fill paints `bg-tint-primary/75` and the track
   `bg-tint-surface-muted/75` (ADR-0082). Nothing changes on the page surface, and a consumer colour paints exactly as
   written.
5. **Also c-file-upload:** a `progress-bar` part on a row's fill. Its `progress` part is that row's progress track.
   c-toast's close timer stays as it is: a different job, left for a 4.x request.
6. **Glossary:** add a separate **Progress track**, plus **Bar** and **Progress bar**. Flag "track" and "bar". The
   button group's **Track** stays unchanged, with its hairline.
7. **ADR-0086**, recording all of this.

Decided without a question (each is the only option that holds):
- **Forced colors.** The native `<progress>` drew itself in Windows High Contrast; plain backgrounds are forced to
  `Canvas`, so the bar would vanish. Under `forced-colors: active` the bar takes `forced-color-adjust: none;
  background-color: Highlight` and the track `outline: 1px solid CanvasText`.
- **The track owns the geometry.** The bar fills the track's content box, so `::part(track) { height; padding }`
  replaces 3.x's `--c-progress-bar-height` and `--c-progress-bar-border-width`.
- **`role="progressbar"` sits on the track, not the root.** Progressbar children are presentational, and the details
  line must stay readable.

## Markup (`c-progress-bar/CProgressBar.vue`)

```html
<div part="root">
  <div part="track" role="progressbar" aria-valuemin="0" aria-valuemax="100"
       :aria-valuenow (absent while indeterminate) :aria-label="label || controlAttrs['aria-label']">
    <span class="internal clip: relative h-full overflow-hidden rounded-[inherit] transform-gpu">
      <span part="bar" :style="indeterminate ? undefined : { width: `${safeValue}%` }"></span>
    </span>
  </div>
  <div part="details">…unchanged…</div>
</div>
```

- **tv slots:**
  - `track`: `h-4 w-full basis-full rounded-full p-1 bg-tint-surface-muted/75`, with `flex-1` under `singleLine`.
    Same box as the old label's `m-1` + `w-[calc(100%-8px)]` + 4px ring.
  - `bar`: `block h-full rounded-[inherit] bg-tint-primary/75 transition-[width] duration-300 ease-in-out`.
  - The internal clip keeps the indeterminate sweep inside the inner pill rather than over the frame.
- **Escape-hatch `<style>`:**
  - Delete every `progress` / `::-webkit-*` / `::-moz-*` rule and the `.c-progress*` marker classes.
  - Move the sweep onto the bar under `indeterminate` (absolute, `left:-100%`, `w-1/2`) and keep the
    `c-progress-indeterminate` keyframes. Its motion stays under reduced motion, since activity indicators keep moving
    (ADR-0057).
  - Add the forced-colors block.
- **Unchanged:**
  - `useControlAttrs`.
  - `useIdReferences('[role="progressbar"]')` (the selector still matches).
  - The host's `aria-busy` and `title`.
  - `inheritAttrs: false`.
  - Drop the `focus-within` outline: nothing inside can take focus.
- **Docblock:**
  - `@csspart track - The progress track: the ground the bar grows along, carrying the progressbar role`
  - `@csspart bar - The bar showing the value: the fill, or the looping sweep while indeterminate`
  - Rewrite the tv comment; the "old `--c-progress-bar-*`" history goes.

## Commits

### A. `Feat(c-progress-bar): Recolour the progress track and bar with ::part() (ADR-0086)`

**Test-first:**
1. Write the specs.
2. Author the visual baselines on the parent (old markup) with `test:update`.
3. Confirm that the behaviour specs fail on the parent.

**Specs:**
- **`CProgressBar.spec.ts`:**
  - Update the two `progress` lookups to `m.part('track')`.
  - New tests:
    - A document stylesheet's `c-progress-bar::part(track|bar) { background-color }` reaches the painted elements:
      check `getComputedStyle` on `m.part('track')` and `m.part('bar')`.
    - The bar's width is `value`% of the track's content box. Measure rects, since the host is `display: contents`.
    - The track has `role="progressbar"` with valuenow/min/max, and no valuenow while indeterminate.
    - `::part(bar)` also colours the indeterminate sweep.
    - Under forced colors the bar's background is `Highlight`, unlike the track's. This needs a new
      `emulateForcedColors` command beside `emulateReducedMotion` in `vitest.browser.shared.ts` and
      `src/test/commands.d.ts`. Use `chromiumOnly(reason)` only if Playwright can't emulate forced colors in an
      engine.
- **Visual baselines,** both modes, via `matchScreenshotInBothModes`:
  - values 0, 40, 100 and -5 (error details);
  - `single-line`;
  - indeterminate, with its animation paused at a fixed `currentTime`.
- **Pixel check:** after the change, compare the new PNGs against the parent's with pngjs. Expect identical (or AA-only)
  pixels, since the 1% budget would hide a wash change (reference_visual_baseline_pixel_regen).

**Other changes:**
- **Snapshots:** update `api.snapshot.json` (parts `bar, details, root, track`) and regenerate the manifest.
  `lint:api` must report one addition.
- **`usage.md` Customization:**
  - `::part(track)`: `background-color`; `height`; and `padding`, which sets the frame.
  - `::part(bar)`: `background-color`, the sweep included.
  - Default colours: the primary bar on a muted track.
  - A short CSS example.
  - Accessibility: "a `role="progressbar"` element", not "a native `<progress>`".
- **Docs `app/content/migration-api.ts`:** specific c-progress-bar `cssProperty` entries:
  - `--c-progress-bar-color` → `::part(bar) { background-color }`
  - `--c-progress-bar-background-color` → `::part(track) { background-color }`
  - `--c-progress-bar-height` → `::part(track) { height }`
  - `--c-progress-bar-border-width` → `::part(track) { padding }`

  The wildcard entry still covers `--c-progress-bar-value`.
- **CONTEXT.md + ADR-0086** (text below).
- **Changeset** (minor, both packages): "`c-progress-bar`'s colours can be restyled with `::part()`.
  `::part(track)` is the ground the bar grows along, its height and padding included. `::part(bar)` is the bar showing
  the value, also the indeterminate sweep. **`::part(bar)` used to name the track: move such a rule to
  `::part(track)`.** The bar draws with plain elements instead of a native `<progress>`; on the page surface it looks
  the same."

### B. `Feat(c-file-upload): A progress-bar part for a row's bar`
- `CFileUpload.vue`: add `part="progress-bar"` on the `ui.bar` span, plus an `@csspart progress-bar - The bar showing a
  row's upload progress, or its looping sweep while indeterminate` docblock tag. Mention it in the `progress` part's
  description.
- **Spec** in `CFileUpload.spec.ts`: `::part(progress-bar) { background-color }` reaches an uploading row's bar. It
  fails before: the part doesn't exist.
- `api.snapshot.json`, the usage.md Customization line, and a minor changeset.

## Glossary text (CONTEXT.md, "Progress & loading")

- **Progress bar** (`c-progress-bar`): The linear progress indicator: a **bar** along a **progress track**, with an
  optional details line; determinate, or indeterminate with a looping sweep. _Avoid_: linear progress, progress line
- **Progress track** (`c-progress-bar`, `c-progress-circle`): The ground a progress indicator's **bar** grows along —
  a recessed `surface-muted` pill or ring with no edge of its own — stamped as the `track` part (`progress` on a
  `c-file-upload` row). Not a **track**: it holds no choices and carries no hairline. _Avoid_: track (unqualified),
  rail, background, well
- **Bar** (progress): The element of a progress indicator that shows the value — the fill along a **progress track**,
  the arc of a **progress circle**, and while indeterminate the looping sweep — stamped as the `bar` part
  (`progress-bar` on a `c-file-upload` row). _Avoid_: fill (a role's painted background), indicator (selection
  controls, the **sliding indicator**), value (the number), progress (the whole component)
- **Track** entry: add "progress track (a progress indicator's ground)" to its _Avoid_ list. In the surface ladder,
  bold "**progress tracks**".
- **Flagged ambiguities:**
  - **"Track"**: (a) the button group's / tab buttons' **track**, (b) the **progress track**. Say "track" only for
    (a).
  - **"Bar"**: (a) the **progress bar** component, (b) a progress indicator's **bar** part. Say "progress bar" for (a)
    and "bar" for (b).

## ADR-0086 `docs/adr/0086-progress-bars-draw-their-track-and-bar-as-plain-elements.md`

Written in the 0085 style: Date, Status ("Accepted. Lands in the rc, before 4.0.0"), Context, Decision, Considered
options, Consequences.
- **Context:** the gap above, and 3.x's two colour properties with no part to migrate to.
- **Decision:**
  - Plain elements under `role="progressbar"`.
  - `track` / `bar` named as on c-progress-circle.
  - `bar` moves from the track to the fill inside the rc: the one exception to the freeze, taken because 4.0.0 would
    otherwise fix opposite meanings of `bar` on the two siblings forever.
  - Opaque 75% tints.
  - The forced-colors rule.
  - The track owns the geometry.
  - c-file-upload's `progress-bar`.
- **Considered options:**
  - Keep `<progress>` and paint with `currentColor`: the fill's shape and transition stay unreachable, and the Firefox
    hack stays.
  - Document chained vendor pseudo-elements: uneven engine support.
  - Keep `bar` and add `fill`: the siblings disagree forever.
  - Alias `part="track bar"`.
  - Full-strength colours: a visual change, left for a separate decision.
  - Keep the opacity: it washes consumer colours.
- **Consequences:**
  - An rc `::part(bar)` rule now styles the fill.
  - No vendor pseudo-elements.
  - Same pixels on the page surface; the dark-mode mix on a raised surface differs slightly, as ADR-0082 accepts.
  - Firefox now matches Chromium's look.

## Verification
- **Chromium,** one spec file per run (OOM): `pnpm --filter @cscfi/csc-ui exec vitest run --project browser
  <abs>/CProgressBar.spec.ts`, then CFileUpload and `test/conformance/all-components.spec.ts` (axe progressbar name,
  typography). Rebuild tokens first (`pnpm ui style-dictionary:build`).
- **Firefox:** `TEST_BROWSERS=firefox pnpm exec vitest run --project "browser (firefox)" <same paths>`, using the
  scratchpad install from the last task (firefox-1522 + chromium symlinks). WebKit is CI-only; say so in the hand-off.
- **Pixel diff:** pngjs, old vs new baselines.
- **Fails on the parent:** check each commit's specs against its parent (worktree, or `git show HEAD:path` swaps;
  never stash).
- **Gates:** `pnpm ui build` (manifest), `pnpm ui lint:api` (additions only), `pnpm lint` (tint guard, migration-guide
  guard, docs parity), `pnpm --filter @cscfi/csc-ui run type-check`, `pnpm ui test:node` (with
  `src/api-snapshot.node.spec.ts -u` first). Run the docs example smoke if memory allows, since the c-progress-bar
  canons are basic and indeterminate.

## Follow-ups (not in this work)
- **MyCSC:** grep for `c-progress-bar::part(bar)` when taking the next rc.
- **c-toast's timer:** a bar part on a 4.x request.
- **c-progress-circle under forced colors** (SVG strokes): check separately.
- **The progress track reads about 1.1:1 against the page:** a colour decision, with a rendered comparison first.
