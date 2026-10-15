# c-color-picker: grilling record + implementation plan

> **Status: IMPLEMENTED 2026-10-08, committed 2026-10-15.** Component, shared shell changes, specs (45 browser + 42
> node), 18 visual baselines, conformance enrolment, API snapshots, React wrapper, usage.md, six docs canons in
> all flavours and a changeset are in the working tree. ADR-0069/0070 are *Accepted*.
> Not yet done: the manual checks (screen reader, a phone, Firefox ESR headless) — see Verification.
>
> Deviations from the plan below:
> - The slider parts are `hue-slider` / `alpha-slider`: the analyzer's defaultable-binding lint reads a static
>   `part="alpha"` as a direct binding of the `alpha` prop (`="alpha"`), a false positive.
> - `shadow` is defaultable too, like every sibling field (decision 19 listed the rest of the usual set).
> - Colour reading skips chroma clamping when every channel already rounds onto a byte: a spelling a rounding
>   hair outside sRGB (dark gamut-edge blues) was otherwise desaturated and failed to round-trip. 69 of 140,608
>   sampled colours need the ≤6-decimal oklch fallback.
> - culori has no types: `src/theme/culori.d.ts` declares the slice the TypeScript sources call.
> - CONTEXT.md also gained `c-time-picker` in the Top layer / Fullscreen panel / Control height lists it was
>   missing from.


## Context
`_todo/color-picker.md` asks for a colour picker component: keyboard-navigable and accessible, a toggleable
format (hex, rgba, oklch), and an option to limit the selection to predefined swatches. Grilled 2026-10-08.

## Decisions (grilling log)
1. **Shape — field + panel.** A labelled value control at control height, built like the date and time pickers
   (ADR-0058/0062): a typeable text field, a swatch button / Alt+↓ opens a `role="dialog"` panel, a narrow
   viewport opens the fullscreen panel with Done (ADR-0050/0066). Rejected: inline surface only; an `inline` prop.
2. **Value notation is the consumer's; the toggle is an editing view.** A prop fixes the value's notation —
   `hex | rgb | oklch` — and every emission is in it. The user's in-panel toggle (HEX | RGB | OKLCH) only switches
   the channel editor and never emits. `rgb` not `rgba` (CSS Color 4 `rgb()` takes alpha). Rejected: the toggle
   rewriting the value (a change event for the same colour, three grammars to parse); no toggle at all.
3. **sRGB gamut, HSV area.** The 2-D area is saturation × brightness with a hue slider (CSS gradients). Text outside
   sRGB (`oklch(0.7 0.3 150)`, `rgb(300 0 0)`) is gamut-mapped on commit — L and H kept, chroma clamped, the ramp's
   `clampChroma` — and the field shows the mapped spelling. Rejected: out-of-gamut = bad input; an OKLCH-native area.
4. **Alpha is opt-in (`alpha`).** Without it: no alpha slider / A channel, typed alpha dropped to opaque on commit.
   With it: alpha slider (checkerboard track) + A channel; alpha is written only when below 1, so an opaque colour
   spells the same either way. Rejected: always-on alpha; no alpha.
5. **The colour model is 8-bit RGBA.** A committed colour is four bytes; each notation is a spelling at the fewest
   decimals that round-trip to the same bytes — hex lowercase `#rrggbb[aa]`; `rgb(R G B[ / a])` (modern space
   syntax, integer channels); `oklch(L C H[ / a])` (L, C ≤ 4 dp, H ≤ 2 dp, alpha ≤ 3 dp, trailing zeros trimmed).
   ADR-0041's round-trip rule, trimmed for humans (cssColor pins 4 dp for byte parity — not reused verbatim).
   Rejected: a float model (views drift, fuzzy equality); cssColor's fixed 4 dp.
6. **Typing takes any CSS colour, unmasked.** culori parse + bare-hex leniency (`1F6FEB` → `#1f6feb`), committed on
   Enter/blur (useTypedField), re-spelled in `format`. Unparseable text is **bad input** (text kept, value `null`,
   `:state(bad-input)`). Needs useTypedField to run without a mask. Rejected: current-notation-only; hex mask.
7. **Swatches: suggestions by default, opt-in restriction.** `swatches` adds a grid under the free picker; a pick
   commits that colour. The restriction (prop name TBD) makes the field **select-like**: readonly, opened by click /
   Enter / Alt+↓, showing the swatch chip + name; the panel is the swatch grid only. Value still spelled in
   `format`. Rejected: keeping the typed field under the restriction; no restriction (c-select with chips).
8. **Anchored panel: live commit, `change` on release.** Discrete picks (area click, arrow step, swatch, channel
   entry) emit `change` + `update:value` + `input`; the panel stays open (ADR-0062). A pointer drag on the area or a
   slider emits `update:value` + `input` per move and one `change` at pointerup (native range split) — a new emit
   helper and a refinement of the value-control contract. Fullscreen: pending value + Done (ADR-0066). Rejected:
   every event per move (c-slider); commit on release only (no live v-model preview).
9. **Area keyboard: one Tab stop, two hidden native ranges** (React Aria ColorArea pattern). ←/→ saturation,
   ↑/↓ brightness, Shift+arrow / PgUp/PgDn ±10, Home/End. Each range has an `aria-valuetext`. Hue (0–359°) and alpha
   (0–100%) are local native ranges, not nested `c-slider`. The panel keeps its own HSV position (hue survives a
   grey); a step that does not change the bytes moves the thumb and emits nothing. Rejected: one `role=slider` div;
   two Tab stops.
10. **Field anatomy: the colour button.** The trailing 40px opener (28px in a small field; TypedField `#trigger`) is
    a chip painted with the colour — checkerboard under alpha, an empty "no colour" look when `null` or bad input,
    a load-bearing hairline (ADR-0042) so white reads on white. Clear sits before it. Restricted mode: a leading
    chip + c-select's chevron. Rejected: leading chip as opener; chip + separate palette icon button.
11. **The prop is `format`** (`'hex' | 'rgb' | 'oklch'`, `@defaultable 'hex'`). CONTEXT.md names the concept
    **Notation** and flags "format" as overloaded (date/time display pattern vs colour notation). Rejected:
    `notation`, `value-format`.
12. **`swatches`: `(string | { value, name? })[]`, property only.** A swatch's name is `name`, else its value spelled
    in `format`. Unparseable swatch values warn once and are skipped; `swatches-only` warns once in dev for unnamed
    swatches. No automatic colour naming. Rejected: names required; auto-naming (translated vocabulary).
13. **Swatch grid: arrows move, Enter/Space/click picks.** One Tab stop, a `role="listbox"` laid out as a grid, real
    focus on the swatch; 2-D arrows + Home/End move without committing; Tab in lands on the selected swatch, else the
    first. With suggestions a pick follows decision 8 (live / pending in fullscreen). Under `swatches-only` a pick
    commits and closes **in every layout** — c-select's model, so its fullscreen panel has no Done (ADR-0066 stays
    pickers-only in spirit). Rejected: selection follows focus; Done under `swatches-only`.
14. **The restriction prop is `swatches-only`** (presence-only boolean); the glossary names the mode **Swatch-only**.
15. **Channel editor: per-channel native inputs.** HEX = one box (6/8 digits); RGB = R G B (0–255); OKLCH = L (0–1)
    C (0–0.4) H (0–360); A (0–100%) under `alpha`. `inputmode="decimal"` (the HEX box `text` — decimal can't
    type a–f), labelled per channel. ↑/↓ ±1 step
    (Shift ±10) and each nudge commits; typed text commits on Enter/blur, clamped to the channel range; garbage
    reverts (channels have no bad-input state — only the field does). An OKLCH nudge that leaves sRGB is
    gamut-mapped, so C stops at the gamut edge. The **notation switch** is a row of native `aria-pressed` toggles
    opening on `format`. Rejected: one text box per view; nested `c-number-field` (breaks the native Tab trap).
16. **No eyedropper in v1** — parked as a follow-up (opt-in, Chromium-only `EyeDropper`).
17. **Small calls (accepted as a set):** focus on open → the area (swatch-only: selected swatch, else first); Tab
    cycle area → hue → alpha → notation switch → channels → swatches → Done. Empty open (null / bad input) lands on
    the first swatch, else white with hue at red — landing commits nothing. Enter on the area or a slider closes;
    a channel's Enter commits the channel; fullscreen Enter acts as Done. Escape closes and returns focus to the
    input. Anchored panel ~280px fixed width (no matchWidth). Swatch-only + a programmatic value matching no swatch:
    shown spelled, no swatch selected, not bad input. `change:text` from the shell.
18. **Two ADRs** (0069 value/notation, 0070 field/panel), Proposed until ship — drafts below.
19. **Defaultable props:** `format`, `alpha`, `size`, `labelOnTop`, `hideDetails`, `texts`. Not: `swatches`,
    `swatchesOnly`. Add the tag to `appDefaults.spec.ts`'s pinned allow-list. Rejected: defaultable `swatches`.

## Exploration notes (2026-10-08)
- **culori** is already a runtime dependency (ADR-0011), bundled; `src/theme/ramp.js` uses `converter`,
  `clampChroma`, `formatHex`. `cssColor()` (hex → shortest round-tripping oklch) is internal. A component-local
  `colors.ts` (like `dates.ts` / `times.ts`) on culori is the natural home for parse/format/HSV.
- **c-slider** is a 1-D native `<input type="range">`: `aria-valuetext` hard-wired to `value+unit`, tooltip formats
  with a fixed `fi-FI` locale, thumb fixed to `--c-primary`. Only `::part(ticks)` could paint a gradient. Poor fit
  for hue/alpha tracks.
- **Shell**: `useTypedField` (codec `{format, parse, isUsable, isValue}`, string values, always applies a mask —
  `MaskSlot[]` can be built by hand), `TypedField.vue` (`#trigger` slot for the panel button), `useAnchoredPanel`
  (popover, light dismiss, fullscreen layout + page lock). Host supplies the dialog card, `PanelHeadingRow`, the
  Done button + pending value, `bad-input` state. Free-text `rgb()`/`oklch()` cannot be masked today.
- Prior art: docs `ColorSwitcher.vue` (swatch menu); `DEFAULT_SEEDS`/`FAMILIES` exported "for a theme UI (colour
  pickers…)". No colour picker anywhere in Stencil-era code.

## Staged CONTEXT.md edits
New section **### Colour picker** after **### Time picker**:

- **Colour picker** (`c-color-picker`): A **value control** for one colour, built like the **date picker**: a
  typeable **value field** that takes any CSS colour and commits it in the picker's **notation**, and a panel opened
  by its **colour button** or Alt+↓, never by typing. The value is a string in that notation, `null` when empty;
  every colour it holds is 8-bit sRGB, with alpha only under `alpha`. Distinct from the native
  `<input type="color">`. _Avoid_: Colorpicker, colour input / colour field (the native one), colour well
- **Notation**: The CSS syntax a **colour picker**'s value and field text are written in — `hex`, `rgb` or `oklch`,
  set by its `format`. Each notation spells the same 8-bit colour at the fewest decimals that round-trip, so
  changing notation never moves the colour. _Avoid_: Format (the prop's name, and the date and time pickers' display
  pattern), colour space (every colour here is sRGB; oklch is a spelling), rgba (the legacy alias of `rgb`)
- **Notation switch**: The HEX | RGB | OKLCH toggle row in the colour picker's panel choosing which **channel
  editor** shows. A view only — it never changes the value or its notation. _Avoid_: Format toggle, mode switch, tabs
- **Channel editor**: The panel's labelled inputs for one **notation** — a single hex box, R G B, or L C H — plus A
  under `alpha`. The **fullscreen panel**'s only text entry. _Avoid_: Inputs (unqualified), sliders
- **Colour area**: The panel's saturation × brightness square at the current hue — one Tab stop whose arrow keys
  move both axes. _Avoid_: Canvas, palette, gradient, 2D slider, colour field
- **Colour button**: The trailing button of the colour picker's field, painted with the current colour, that opens
  the panel. _Avoid_: Swatch (a swatch is a predefined colour), chip, preview, trigger (the consumer-supplied element)
- **Swatch**: One predefined colour a consumer offers through `swatches`, named by its `name` — else its spelled
  value — for assistive technology and in a **swatch-only** field. Suggestions beside the free picker by default.
  _Avoid_: Preset, palette (the design system's whole ramp set), sample, chip
- **Swatch-only** (mode): The colour picker under `swatches-only`: the field is readonly and opens the panel like
  `c-select`'s, the panel holds only the swatch grid, and a pick commits and closes in every layout — no **Done
  button**. _Avoid_: Restricted mode, preset mode, palette mode

Amend existing entries:
- **Bad input**: "a **date picker**, **time picker** or **colour picker**"; for the colour picker only unparseable
  text produces it (out-of-gamut text is mapped, not bad).
- **Pending value** / **Done button**: "date, time and colour picker" (Done: not under **swatch-only**).
- **Fullscreen panel**: add `c-color-picker`'s panel to the list; "In the date, time and colour pickers the panel
  ends in a row holding the **Done button**" (swatch-only excepted — it behaves like `c-select`).
- **Value control**: add the colour picker to the list, and: "The colour picker reports a drag on its **colour
  area** or sliders through `update:value` and `input` on each move and fires `change` once, on release;
  `c-slider` still fires all three per move." (Scoped — not stated as universal, or c-slider breaks it.)
- **Top layer**: add the colour-picker panel. **Control height**: add `c-color-picker` to the `c-input` users.
- **Keyboard modality**: "(the **day grid**, a **time column**, the swatch grid)".
- **Transient list panel** / **Peek**: add the colour picker's swatch grid (it hides its scrollbar and peeks when it
  overflows the panel ceiling).
- **Flagged ambiguities**: add **"Format"** — (a) the date and time pickers' display-and-parse pattern (`DD.MM.YYYY`,
  `HH.mm`), which leaves the ISO value alone; (b) the colour picker's `format` prop, which sets its **notation** and
  so the value itself. Say **"display pattern"** for (a) and **"notation"** for (b). Add **"Swatch"** — (a) the
  colour picker's predefined colour, (b) the docs site's decorative token samples; say **"token sample"** for (b).

## Staged ADRs (Status: Proposed — flip to Accepted when the component ships)

**ADR-0069 — Colour values are 8-bit sRGB spelled in a chosen notation.** Context: the todo asks for a toggleable
hex / rgba / oklch format; a form needs one predictable grammar, and the library authors colour in OKLCH but
validates as 8-bit hex (ADR-0011, ADR-0041). Decision: the consumer's `format` fixes the value's notation; the
panel's notation switch is a view. A colour is four bytes (sRGB + alpha); each notation spells them at the fewest
decimals that round-trip (hex lowercase; `rgb(R G B / a)` space syntax; oklch L, C ≤ 4 dp, H ≤ 2 dp, alpha ≤ 3 dp)
— ADR-0041's rule trimmed for humans. Text outside sRGB is gamut-mapped on commit (chroma clamped at the same L
and H, the ramp's `clampChroma`). Alpha is opt-in; without it typed alpha is dropped. Typing takes any CSS colour,
unmasked; unparseable text is bad input. Alternatives: the toggle rewrites the value (a change for the same
colour; three grammars); a float model (views drift); cssColor's fixed 4 dp (noisy); out-of-gamut as bad input
(pasted P3 colours fail); an OKLCH-native area (hex/rgb cannot hold what it reaches); `notation` / `value-format`
as the prop name. Consequences: typed oklch may come back with fewer or different digits; `format` now means two
things across the library (flagged in CONTEXT.md).

**ADR-0070 — c-color-picker is the typed-field picker with a live HSV panel.** Extends ADR-0058/0062/0066.
Decision: the typed-field shell with a trailing colour button (40px / 28px) as the opener; a `role="dialog"`
panel with a saturation × brightness area (one Tab stop over two hidden native ranges — React Aria's ColorArea),
hue and alpha native ranges (not `c-slider`), a notation switch and a per-channel editor (native inputs, so the
Tab trap reaches them), and a swatch grid (`role="listbox"`, arrows move, Enter/Space/click picks). Live commit in
the anchored panel; a drag emits `update:value` + `input` per move and `change` once on release — a refinement of
the value-control contract; fullscreen panels hold a pending value until Done. `swatches-only` turns the field
select-like and follows `c-select` in every layout (commit and close, no Done). Alternatives: inline surface;
`inline` prop; a single `role=slider` area; two Tab stops; `c-slider` / `c-number-field` nested; every event per
drag move; commit on release only; selection-follows-focus swatches; Done under swatch-only; a leading chip; an
eyedropper (follow-up). Consequences: one component, two field models; the colour picker's X discards (picker) but
its swatch-only X closes (select) — recorded divergence; a new emit helper.

## Implementation plan
Paths are under `packages/csc-ui/src/` unless stated. Mirror `components/c-time-picker/CTimePicker.vue` throughout
(TypedField + `#trigger` 3–35, popover/dialog card 39–58, PanelHeadingRow 59–64, Done row 132–157, event map 464–489,
`texts` 295–374/607–637, defaultables 557–580, boolean quirk 651–657, useTypedField call 687–707, pending 711–715,
bad-input state 717–720, Enter→Done 955–962, trap 1056–1093 — copy CDatePicker's `checkVisibility`/`[inert]` filter
at 2209–2219 —, useAnchoredPanel 1191–1227, escape hatch 1256–1307).

**P0 — record (on approval):** copy this plan to `_plan/c-color-picker.md`; apply the staged CONTEXT.md edits;
write `docs/adr/0069-…` and `0070-…` (Proposed).

**P1 — shared (own commit, no behaviour change for the pickers):**
- `shared/useTypedField.ts`: `mask?` optional — skip `applyMask` when absent (an empty `MaskSlot[]` drops every
  character, `inputMask.ts:208-299`); add `moveValue(next)` (set text, snapshot value at first move, emit via
  `emitModelInput`) and `settleValue()` (emit `change` only if the value differs from the snapshot).
- `shared/emitModelValue.ts`: `emitModelInput` (mirror `host.value` → `update:value` → bubbling `input`) and
  `emitModelSettled` (`change`); cover in `emitModelValue.spec.ts`.
- Re-run `CDatePicker.spec.ts`, `CTimePicker.spec.ts`, `inputMask.node.spec.ts` (one file per run).

**P2 — `components/c-color-picker/colors.ts` + `colors.node.spec.ts`:** culori from `'culori'` (not `culori/fn`
— `parse` needs the registered modes; zero added bytes, ramp.js already bundles it): `parse`, `clampChroma`,
`converter`, `formatHex`, `formatHex8`. Own `rgb()` spelling (culori's `formatRgb` is legacy comma syntax).
API: `readColor(text, alpha)` (bare hex 3/4/6/8, parse, clampChroma, round to bytes, force opaque without alpha),
`spell(c, notation)` (shortest round-trip per channel, ≤6 dp fallback instead of throwing), `isColor`, `sameColor`,
`toCss`, `toHsv(c, prevHue)` / `fromHsv`, a `CHANNELS` table, `readChannel` (clamp, null → revert). Node spec: every
CSS colour form; `var()`/`currentcolor`/`color-mix()`/`''` → null; gamut cases; alpha dropped (`transparent` →
`#000000` without `alpha`); spelling snapshots; `readColor(spell(c, n)) == c` over all 4096 12-bit colours × 3
notations + every alpha byte; hue kept on greys; C stops at the gamut edge.

**P3 — `components/c-color-picker/CColorPicker.vue`:**
- Props: `format`, `alpha`, `swatches`, `swatches-only`, `clearable`, `disabled`, `error-message`, `hide-details`,
  `hint`, `host-id`, `label`, `label-on-top`, `name`, `placeholder`, `required`, `shadow`, `size`, `texts`, `valid`,
  `value`. Defaultables per decision 19 via `appDefault` (the analyzer rejects reading `props.format`/`props.texts`).
  Types prefixed `CColorPicker…` (Props, Value, Format, Swatch, Texts) — tag-map private-name clash otherwise.
- useTypedField with `pattern = notation (+ '/a' under alpha)` so a `format`/`alpha` change re-spells without
  emitting; codec `{ isValue: isColor, parse, format, isUsable: () => true }`; `range` false, `reversed: 'keep'`;
  placeholder `#rrggbb` / `rgb(r g b)` / `oklch(l c h)` unless set; `inputmode="text"`.
- Colour button: `c-icon-button` in `#trigger` (`aria-haspopup="dialog"`, `texts.chooseColour`) with a slotted chip
  span (`part="color-chip"`).
- Swatch-only: a plain readonly `c-input` + `role=combobox` input + chevron, as `CTreeSelect.vue:7-99`, leading chip
  in c-input's `pre` slot; the same useTypedField instance (bind `typed.anchor`/`typed.field` by function ref) so one
  useAnchoredPanel serves both; `returnFocusTo` and clear focus the combobox; `confirming` is `&& !swatchesOnly`.
- Panel: colour area (two `sr-only` native ranges, `tabindex` 0 / -1 by active axis, `touch-none`, pointer capture;
  pointerdown/move → `moveValue`, pointerup/cancel/lostpointercapture → `settleValue`), hue and alpha native ranges
  (native `input` → move, native `change` → settle), notation switch, channel editor, swatch grid (columns measured
  from `offsetTop`s at keydown; overflow → hidden scrollbar + peek per ADR-0043 via the shared peek helper).
  Fullscreen routes moves/picks to the pending value. Every focusable native input carries `tabindex="0"` (the trap
  selector misses bare inputs); no `c-*` inside the card.
- Bad input: top-level `computed<boolean>` + `watch` → `setState('bad-input')`, `@cssstate bad-input`,
  `defineExpose({ badInput })`. `@csspart` tags also for the merged shared parts (`input`, `separator`,
  `heading-row`, `heading`, `close`).
- Styling: semantic tokens for chrome; picker data (area/hue/alpha gradients, checkerboard, thumbs) in the ADR-0007
  escape-hatch block fed by inline `--_c-color-picker-*` variables (the c-slider precedent, `CSlider.vue:370-385,
  467-483`) — literal colours there are data that must not flip with the mode; separate `::-webkit-*` and
  `::-moz-range-*` rules. Chip and swatches: `border-divider bg-clip-padding` hairline (ADR-0042); empty look = a
  slash in `on-surface-muted`. `outline-none` restates `outline-solid` (lint:focus). Reduced-motion block
  (`CTreeSelect.vue:1832-1836`). Copy the `@position-try --c-field-panel-above*` block verbatim.
- `src/index.ts`: register after `c-time-picker`, add to `tailwindVariantTags`, export the types.

**P4 — generate:** `pnpm ui build` (tag map, strict manifest; grep dist for the new utilities, rebuild if missing —
new-SFC scan miss); api-snapshot node spec `-u` (`api.snapshot.json`, `api.entry.snapshot.json`); React wrapper
`pnpm --filter @cscfi/csc-ui-react build`.

**P5 — tests:**
- `test/conformance/kinds.ts`: `VALUE_RECIPES['c-color-picker']` (`family: 'change'`, `emptyAware`, two swatches;
  interact = open via the colour button, click the second swatch; `programmatic: '#00ff00'`) and an
  `OVERLAY_RECIPES` entry like c-time-picker's (`:508-514`); `root-part.ts` if needed; `appDefaults.spec.ts` pinned
  allow-list; `index.node.spec.ts` order.
- `CColorPicker.spec.ts`: typing (forms, bare hex, re-spell, bad input + `change:text`), gamut, alpha, no emission on
  programmatic / `format` / `alpha` change, opening rules, focus landing (no commit), area keys + valuetext + no-op
  steps, drag split (N update:value / N input / 1 change; filter composed `input`s), hue/alpha, notation switch never
  emits, channels (nudge commits, clamp, revert, C edge), swatch grid keys + warn-once (`consoleSpy.expect`),
  swatch-only (readonly, opens, commit-and-close in both layouts, no Done, stray value shown), Tab cycle, Escape,
  fullscreen pending/Done/discard, `texts`.
- Visual baselines in both modes: closed field (empty, opaque, translucent, small), anchored panel (hex; alpha +
  swatches; rgb and oklch editors), swatch-only field + panel, fullscreen with Done, fullscreen swatch-only.

**P6 — docs and release:** `usage.md` (first paragraph = description; Notation, Typing and bad input, Gamut, Alpha,
Swatches, Swatch-only, Drag events, Texts); docs examples `packages/csc-ui-documentation/app/examples/c-color-picker/`
— `basic`, `notation`, `alpha`, `swatches`, `swatches-only` (every swatch named, or the dev warning fails the example
smoke), `texts` (every key, all four flavours) — each with `.react.tsx` / `.angular.ts` / `.typescript.html` (+
`.typescript.ts` where an array prop is set); v-model + explicit imports, no `.prop`. Changeset: minor, user-facing,
high-level. Flip ADR-0069/0070 to Accepted when it ships.

**Follow-ups (parked):** eyedropper (opt-in, Chromium `EyeDropper`); reduced-motion block missing in c-date-picker /
c-time-picker (separate Fix with its own spec + changeset).

## Verification
- `pnpm ui test` per file: `colors.node.spec.ts`, `emitModelValue.spec.ts`, `CColorPicker.spec.ts`,
  `CDatePicker.spec.ts`, `CTimePicker.spec.ts` (unchanged), `conformance/*.spec.ts`, `appDefaults.spec.ts`,
  api-snapshot node spec — one file per run (devcontainer Chromium OOM).
- `pnpm ui test:update` in the devcontainer for the new baselines; review the PNGs in light and dark.
- `pnpm build`, then `pnpm --filter csc-ui-documentation test` (example smoke) and the dist smoke.
- `pnpm lint` (tokens, a11y, focus, chart, ramp guards + docs example parity) and the CI `type-check` step
  (`pnpm build` skips spec types).
- Manual: docs dev server (`pnpm dev`, :3500) — keyboard-only pass through field → panel → Tab cycle; a screen
  reader spot check of the area valuetext and swatch names; a narrow-viewport fullscreen run; Firefox ESR headless
  rect check of the anchored panel (ADR-0056 fallback).

---

## Follow-up: colour comparison (2026-10-08, implemented, uncommitted)

## Context
The user asked: "when dialing in the new color and there is a previously set color in the picker, i'd like to see
the original vs the modified color side by side."

Today the panel shows only where the colour is now: the area thumb and the colour button. The anchored panel commits
live (ADR-0062/0070), and Escape keeps those live picks, so once the value starts moving there is neither a
reference point nor a way back.

The outcome is a comparison strip that shows the colour the panel opened on beside the colour it holds now. Clicking
the original restores it.

## Decisions (asked 2026-10-08)
1. **Placement: a full-width strip under the sliders.** It sits between the hue slider (alpha slider under `alpha`)
   and the notation switch. The original is on the left and the new colour on the right, touching with no seam so
   small shifts show. Rejected: a strip above the area (further from the channel editor); a box beside the sliders
   (sliders about 60px narrower, small patches, one slider tall without alpha).
2. **The original half restores.** It is a native `<button>` and a Tab stop, labelled by a new texts key
   `restoreOriginal` ("Restore original colour").
   - In the anchored panel a click commits the original like any pick: `change`, `update:value` and `input`, and
     nothing when the colour is unchanged.
   - In the fullscreen panel the original becomes the pending colour, which Done commits (ADR-0066).
   - The new half is decorative (`aria-hidden`); the area, sliders and channels already expose the colour.
   - Rejected: display only, because there would be no way back after live commits.
3. **No captions.** Left = original, right = new, as in Pickr and design tools; the right half visibly follows every
   move. Rejected: "Original" / "New" captions (two texts keys and about 16px of height).
4. **Defaults I chose without asking:**
   - "Original" = the value when the panel opened, re-snapshotted on every open.
   - The strip shows from the first frame whenever there was a colour, so both halves are equal until a change and
     the layout never shifts.
   - No strip for an empty field or bad input (there is no original), and none under swatch-only (a pick commits and
     closes).
   - Escape keeps its meaning; the original button is the way back.

## Implementation (paths under `packages/csc-ui/src/components/c-color-picker/` unless stated)

**`CColorPicker.vue`**
- **State:** add `const originalColor = ref<null | Rgba>(null)`.
- **Snapshot before `showPopover()`**, so position-try and the Floating UI fallback measure the panel with the strip
  already in it. `onOpened` is too late: it runs inside the `toggle` event, after `showPopover()`, so the panel could
  be measured without the strip and grow afterwards.
  - Rename the `open` taken from `useAnchoredPanel` to `openAnchoredPanel`.
  - Define:
    `const openPanel = () => { if (!isOpen.value) originalColor.value = swatchesOnly.value ? null : committedColor.value; openAnchoredPanel(); };`
  - The `isOpen` guard stops an Alt+↓ while the panel is open from re-snapshotting a live-changed value.
  - Every existing open path (`onOpenRequest`, `togglePanel`, the swatch-only field and combobox) already calls
    `openPanel`, and `onColorButtonClick` runs `typed.commitAll()` first, so typed text is the original.
- **Template:** add this after the alpha slider and before the notation switch, inside `v-if="!swatchesOnly"`:
  ```html
  <!-- The colour comparison (CONTEXT.md): the original colour, restorable, beside the colour the panel holds. -->
  <div v-if="originalColor" :class="ui.comparison()" part="comparison">
    <button :aria-label="t.restoreOriginal" :class="ui.original()" :style="chipStyle(originalColor)"
            part="original-color" type="button" @click="pick(originalColor)" />
    <span :class="ui.newColor()" :style="chipStyle(panelColor)" aria-hidden="true" part="new-color" />
  </div>
  ```
  `pick()` already handles both layouts: in the fullscreen panel it sets the pending colour, otherwise it commits and
  skips an unchanged colour. The `panelColor` watcher re-seats the HSV position.
- **tv slots** (semantic tokens only; the colour paint reuses the `c-color-picker__chip` class, colour over the
  checkerboard):
  - `comparison`: `flex h-6 shrink-0`
  - `original`: `c-color-picker__chip flex-1 cursor-pointer rounded-l-csc-md border border-r-0 border-solid border-divider bg-clip-padding p-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid`
    - The focus ring is outside, so the container is not `overflow-hidden`.
    - lint:focus wants `outline-solid` restated under `outline-none`.
  - `newColor`: `c-color-picker__chip flex-1 rounded-r-csc-md border border-l-0 border-solid border-divider bg-clip-padding`
    - The hairline frame (ADR-0042) keeps white on white legible.
  - Fullscreen variant: `comparison: 'h-11'`, the heading row's touch target. The area is `flex-1` and gives up the
    space.
  - Check the dist contains `rounded-l-csc-md` and `rounded-r-csc-md` (new-SFC scan miss); fall back to
    `rounded-l-[var(--…)]` if the radius namespace lacks them.
- **Texts and docs block:**
  - Texts: add `restoreOriginal?: string` with JSDoc ("Accessible label of the original colour in the colour
    comparison: a click restores it."), and `restoreOriginal: 'Restore original colour'` in `DEFAULT_TEXTS`.
  - `@csspart` lines: `comparison` (the strip of the original and the new colour), `original-color` (the colour the
    panel opened on; a click restores it) and `new-color` (the colour the panel holds now).
  - None of these names matches a defaultable prop, so the analyzer's `="<prop>"` lint stays clear.

**`CColorPicker.spec.ts`** — a new `describe('colour comparison')`:
- An empty field's panel and a swatch-only panel have no `[part~="comparison"]`.
- Opening on `#1f6feb` paints both halves with `#1f6feb`; check `--_c-color-picker-color` on each.
- An area key step changes `new-color` and the value, and leaves `original-color` alone.
- Clicking the original commits `#1f6feb` once (change, update:value, input), and both halves match again. Clicking it
  when nothing changed emits nothing.
- Close and reopen: the original is now the last committed colour.
- Typing a colour and then clicking the colour button: the original is the typed colour.
- Under `alpha`, the original keeps its alpha (`#1f6feb80`).
- Fullscreen panel: step, then restore, then Done emits nothing. Step, then restore, then step, then Done commits
  only the last step.
- `texts`: extend the existing case with `restoreOriginal`.
- Update the existing **focus trap** expectation: `'original-color'` follows `'hue-slider'`.
- Visual:
  - `open-panel`, `open-panel-alpha` and `fullscreen-panel` gain the strip. Delete those six PNGs so `test:update`
    rewrites them; the 1% tolerance would keep the stale ones.
  - Add `open-panel-compared`: open on `#1f6feb`, click the Coral swatch, screenshot. The halves then differ.
  - Review every changed PNG in light and dark.

**Generated:** `pnpm ui build` (strict manifest), then re-snapshot `api.snapshot.json` and `api.entry.snapshot.json`
with `-u` and review the diff: the new texts key and three parts. Rebuild the React wrapper; there should be no
diff, since props and events are unchanged.

**Docs and record**
- `usage.md`, "The panel":
  - Add the Tab cycle stop ("…the sliders, the original colour, the notation switch…").
  - Add a paragraph: when the panel opens on a colour, a strip under the sliders shows that original colour on the
    left beside the colour being picked. Clicking the original, or pressing Enter or Space on it, restores it. In the
    anchored panel that commits it like any pick; in the fullscreen panel it becomes what Done commits. An empty
    field's panel and a swatch-only panel have no comparison.
  - Change the Escape row to "Close; what was picked stays (the original colour restores it)".
- Texts example (`packages/csc-ui-documentation/app/examples/c-color-picker/texts.*`): add
  `restoreOriginal: 'Palauta alkuperäinen väri'` in all four flavours. Parity and example smoke guard this.
- `.changeset/color-picker.md` is new, unreleased and uncommitted. Add one bullet: "When the panel opens on a colour,
  it shows that original colour beside the new one; a click on the original restores it."
- `CONTEXT.md`, colour picker section, after **Colour area**, add a new entry:
  - **Colour comparison**: The strip in the colour picker's panel showing its **original colour**, the value it held
    when the panel opened, beside the colour the panel holds now: the value, or the fullscreen panel's **pending
    value**. A click on the original restores it. Absent when the panel opened empty, and under **swatch-only**.
    _Avoid_: Preview, before/after, old/new swatch (a **swatch** is a predefined colour).
- `docs/adr/0070-…` (Proposed, uncommitted):
  - Add "the colour comparison" to the Panel bullet.
  - Add a **Colour comparison** decision bullet: the snapshot on open, left/right, the restore button committing
    live or setting the pending value, why it is needed (Escape keeps live picks), and the hidden cases.
  - Alternatives: display only (no way back); a box beside the sliders; captions; Escape reverting (would break
    ADR-0062's live commit).
  - Consequence: one more Tab stop.
- `_plan/c-color-picker.md`: append this plan. Update the memory file `project_csc_ui_color_picker.md` with the
  comparison and the snapshot-before-showPopover note.

## Verification
Run one spec file per run (devcontainer Chromium OOM):
- `pnpm ui test:browser src/components/c-color-picker/CColorPicker.spec.ts`.
- Visual: delete the three affected baseline pairs, then
  `pnpm ui test:update src/components/c-color-picker/CColorPicker.spec.ts`, then review the PNGs.
- Conformance, filtered to `c-color-picker`: value-controls, anchored-overlays, all-components. The overlay recipe
  opens a panel with a value; check nothing there counts stops.
- `api-snapshot` node spec.
- `pnpm build`, then the docs example smoke (`pnpm --filter csc-ui-documentation test`).
- `pnpm lint` (oxlint, eslint, guards and example parity), `pnpm run type-check` and `pnpm format:check`.
- Manual (optional): docs dev server, open a set picker, drag, click the original, and check that the strip does not
  push the panel off-screen near the viewport bottom (it flips above).

### Deviations
- `rounded-l-csc-md` / `rounded-r-csc-md` do not exist: the csc radii are `@utility` blocks in `src/tailwind.css` named `rounded-csc-<side>-<size>`. Used the existing `rounded-csc-l-md` and added `rounded-csc-r-md` beside it.
