# Consumer theming API for csc-ui-next (runtime seed → ramp)

## Context

`csc-ui-next` themes components through a two-layer token system (ADR-0010):
**palette tokens** (`--c-primary-500`, mode-independent brand ramps) and
**semantic tokens** (`--c-primary`, `--c-on-primary`, mode-aware roles). Crucially,
semantic tokens reference **multiple** palette steps — light
`primary-hover`→`primary-300`, `primary-subtle`→`primary-100`; dark
`primary`→`primary-400`, `primary-subtle`→`primary-800`. So a consumer who
overrides only `--c-primary-500` today gets a **broken** theme: hover / subtle /
dark states keep the old brand.

The correct math already exists but only at build time:
`scripts/generate-ramps.mjs` turns one seed (step 500) into a full 50–950 OKLCH
perceptual ramp (culori `clampChroma`, anchored so 500 reproduces the seed),
hardcoded to CSC's 8 brand seeds. **Goal: let a consumer supply their own
seed(s) and regenerate the full ramp(s) at runtime**, so an override propagates
through every semantic token in both light and dark mode.

This works because of the existing cascade architecture (verified):
`tokens.css` declares `--c-*` at the document `:root` only (it is **not** adopted
into shadow roots); the adopted `tailwind.css` uses `@theme inline`, so utilities
inline `var(--c-primary-600)` and resolve it by **inheritance from `:root`**.
`tailwind.css` says so directly: *"a consumer overriding `--c-primary-600` still
re-themes at runtime."* Therefore overriding `--c-*` at the document root reaches
every component in every shadow root — no `:host` defaults shadow it.

## Decisions (locked via grill)

1. **Mechanism — runtime JS API.** Not build-time-only, not CSS relative-color.
   Matches the "set the theme" ergonomic, is the only dynamic option
   (per-tenant / theme picker / live preview), and reuses the exact OKLCH
   algorithm for pixel-identical fidelity. (CSS relative-color rejected: fidelity
   drift at gamut extremes, hard break on pre-2024 browsers, `-rgb` triple can't
   be expressed. Build-time rejected as primary but is a near-free secondary
   call site — same core.)
2. **Scope — 8 chromatic seeds only:** `primary, secondary, accent, success,
   info, warning, error, link`. Each supplied seed regenerates its 50–950 ramp
   (+ `-rgb`); semantic tokens re-resolve automatically for both modes. Neutrals
   (`tertiary`, `slate`), `white`/`black`, and semantic role→step mappings are
   **out of scope** (hand-tuned for audited WCAG AA contrast).
3. **API surface — dual, over one shared core:**
   - `applyTheme(seeds)` — client convenience; computes ramps and sets `--c-*`
     as **inline custom properties on `document.documentElement`** (highest
     priority, order-independent vs `tokens.css`, trivially resettable). **Merges**:
     each call sets the passed families and leaves others intact.
   - `themeToCss(seeds)` — **pure**; returns a `:root{…}` CSS string for
     zero-flash `<head>` / server-side injection. `applyTheme` uses it internally.
   - `resetTheme(families?)` — removes previously-applied inline props (all, or
     the named families).
4. **Color engine — culori (tree-shaken).** The shared `ramp()` core imports
   culori (`converter`, `formatHex`, `clampChroma`); build script and runtime run
   the **same code** → guaranteed parity with the baked-in built-ins. culori
   moves from devDependency to a runtime **dependency** (~2–4 KB tree-shaken ESM).
5. **FOUC** — real only when called late on the client over SSR'd content; zero
   with `themeToCss` in `<head>`/server or `applyTheme` before first paint (same
   pattern the existing `useTheme` dark-mode init uses). Docs must steer
   consumers to the safe call sites.

## Terminology (apply to `CONTEXT.md` under "Theming & dark mode")

- **Family**: one of the 8 chromatic brand/status ramps a consumer may re-seed
  (`primary`…`link`). _Avoid_: color, type, palette (a palette token is one
  step of a family).
- **Seed**: the single step-500 value that anchors a family's generated ramp
  (500 reproduces the seed exactly; 50–950 are derived perceptually). _Avoid_:
  base color, brand color (ambiguous).

## Implementation

**New shared core** — `src/theme/ramp.{ts|js}` (author as plain ESM with JSDoc
types so both the Node build script and the browser TS bundle import it with no
TS loader):
- `FAMILIES` — the 8 family names (single source of truth).
- `ramp(seedHex) → { '50': '#rrggbbff', … '950': … }` — the exact curve moved
  verbatim from `generate-ramps.mjs` (`C_FACTOR`, `L_LIGHT_END`, `L_DARK_END`,
  anchor logic, `clampChroma` + `ff` alpha).
- `familyVars(family, seedHex) → Record<string,string>` — the `--c-<family>-50…950`
  map **plus** `--c-<family>-rgb` (bare `r, g, b` triple from the seed), matching
  `utils/createTheme.cjs` / `utils/getRgbValue.cjs` output byte-for-byte.
- Types: `Family` (union), `ThemeSeeds = Partial<Record<Family, string>>`.

**Refactor** `scripts/generate-ramps.mjs` to import `ramp`/`FAMILIES` from the
shared core (delete its inlined copy). Behaviour and `base.json` output unchanged.

**New public API** — `src/theme/applyTheme.ts`:
- `themeToCss(seeds)`: validate each key ∈ `FAMILIES` and each value parses via
  culori (throw a clear error otherwise — dev-facing, fail loud); build a
  `:root{ … }` string from `familyVars` for each seed.
- `applyTheme(seeds)`: for each seed call `familyVars` and
  `documentElement.style.setProperty(name, value)`; track applied prop names for
  `resetTheme`. Guard `typeof document` for SSR safety.
- `resetTheme(families?)`: `removeProperty` for tracked names.

**Export** from `src/index.ts` (alongside `defineCustomElements`, `migratedTags`):
`applyTheme`, `themeToCss`, `resetTheme`, and `type Family`, `type ThemeSeeds`.

**package.json**: move `culori` from devDependencies to dependencies.

**Docs** (`packages/csc-ui-documentation`): add a "Custom brand theming" page —
`applyTheme` for dynamic/client, `themeToCss` in `<head>`/SSR for zero-flash;
show a live seed picker; call out the 8 overridable families and that neutrals/
surfaces are fixed.

## Docs deliverables (create at implementation time — blocked now by plan mode)

- **`CONTEXT.md`**: add **Family** and **Seed** to the theming glossary section.
- **ADR-0011** `docs/adr/0011-consumer-theming-runtime-seed-ramp.md`: record the
  runtime-vs-build-time-vs-CSS-relative-color trade-off and the shared-core
  architecture. (Qualifies: hard to reverse — public API + culori becomes a prod
  dep; surprising — "why runtime, not the existing build script?"; real
  alternatives weighed.)

## Verification

1. **Parity test** (guards fidelity + the extraction): for all 8 CSC seeds,
   assert `ramp(seed)` equals the values currently in `tokens/theme/base.json`,
   and `familyVars` matches the emitted `--c-*`/`-rgb` in
   `src/styles/css/tokens.css`. Proves runtime output == build output.
2. **`themeToCss` snapshot** for a sample seed (steps + `-rgb`, `:root{}` shape).
3. **Validation**: invalid color and unknown family both throw.
4. **Manual (docs site, `CSC_UI_IMPL=next`)**: `applyTheme({ primary:'#7c3aed' })`;
   screenshot light + dark (headless-chromium recipe in memory). Verify
   `c-button` solid / hover / subtle and focus ring all shift to the new brand in
   both modes, and that non-overridden families (e.g. `error`) are unchanged.
   Inspect a `c-button`'s computed `background-color` to confirm the override
   crossed the shadow boundary.
5. **Zero-flash check**: inject `themeToCss(...)` into `<head>` on the SSR docs
   page; confirm no teal→brand flash on load.
6. `pnpm build` + `pnpm type-check` clean; `lint:tokens`/`lint:contrast` still pass.
```
