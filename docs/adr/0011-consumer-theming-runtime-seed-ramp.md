---
status: accepted
---

# Consumer theming via a runtime seed→ramp API

Consumers rebrand `csc-ui-next` by supplying just the step-500 **seed** for the chromatic **families** they want to change (`primary`…`link`); the full 50–950 ramp is regenerated at runtime from that seed and written as `--c-*` custom properties, so the override propagates through every semantic token in both light and dark mode. The public surface is `applyTheme(seeds)` (sets inline props on `<html>`) and `themeToCss(seeds)` (a pure `:root{…}` string for `<head>`/server injection), both built on one shared `ramp()` core (`src/theme/ramp.js`) that the build-time generator (`scripts/generate-ramps.mjs`) also uses.

## Context

Semantic tokens (ADR-0010) reference *multiple* palette steps — light `primary-hover`→`primary-300`, `primary-subtle`→`primary-100`; dark `primary`→`primary-400`, `primary-subtle`→`primary-800`. So a consumer who overrides only `--c-primary-500` gets a broken theme: hover/subtle/dark states keep the old brand. Correctly re-theming means regenerating the whole ramp from the new seed — exactly what `generate-ramps.mjs` already did at build time (OKLCH perceptual curve + culori `clampChroma`, anchored so 500 reproduces the seed), but only for CSC's own 8 hardcoded seeds.

## Decisions

- **Runtime JS API, not build-time-only and not CSS relative-color.** A function call matches the "set the theme" ergonomic and is the only option that supports dynamic theming (per-tenant, theme picker, live preview). Because the core is pure "seeds → CSS text", the *same* function also runs server-side/in `<head>`, so the build-time use case is a call site, not a separate mechanism.
- **One shared `ramp()` core.** The math is extracted into `src/theme/ramp.js` (plain ESM so the Node build script imports it without a TS loader; typed via a hand-written `ramp.d.ts`). Build and runtime run identical code → consumer-branded ramps are byte-for-byte identical to the built-ins, guarded by `scripts/check-ramp-parity.mjs` (`npm run lint:ramp`).
- **culori becomes a runtime dependency** (was build-only), tree-shaken. Accepted for guaranteed fidelity over a hand-rolled OKLCH implementation that could silently drift from the baked-in palette.
- **Scope: the 8 chromatic families only.** Neutrals (`tertiary`, `slate`), `white`/`black`, and the semantic role→step mappings are out — they are hand-tuned for audited WCAG AA contrast and would regress if regenerated or remapped.

## Considered options

- **Build-time generation** (consumer config → static `tokens.css`): zero runtime cost/bundle, but not dynamic and adds build-pipeline friction. Kept as a supported call site of the same core, not the primary API.
- **Pure CSS relative-color** (`oklch(from var(--c-primary-500) …)`): zero JS, but the chroma-clamp diverges from culori at gamut extremes (ramps wouldn't match the built-ins), it hard-breaks on pre-2024 browsers (an unsupported `oklch(from …)` invalidates the whole custom property), and the `--c-*-rgb` compositing triple can't be expressed.

## Consequences

- FOUC is possible only when `applyTheme` runs late on the client over SSR'd content; `themeToCss` in `<head>`/server or calling `applyTheme` before first paint eliminates it (same discipline as the existing `useTheme` dark-mode init). Docs steer consumers to the safe call sites.
- The override reaches shadow roots because `tokens.css` declares `--c-*` at the document `:root` (not adopted into shadows) and the shadow-adopted Tailwind sheet resolves them by inheritance — see `src/tailwind.css`.
