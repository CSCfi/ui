---
status: accepted
---

# Component tests run in a real browser through Vitest browser mode

Automated tests for `packages/csc-ui` run against the **registered custom elements** in headless Chromium, driven by Vitest 5 browser mode on Playwright. Behaviour specs are colocated with the SFC (`C<Name>.spec.ts`, ADR-0026), conformance suites enrol every tag of a kind from generated data, an API snapshot of the manifest guards the public surface, visual baselines are PNGs committed beside the spec, and a docs-package project mounts every canon example as a smoke. DOM shims (jsdom, happy-dom) are not used for components at all.

## Context

The 3.x Stencil suite died with Stencil in the 4.0 rewrite; nothing replaced it. Verification became a per-feature raw-CDP harness rebuilt in a scratchpad and recorded as prose in each plan's Verification section. Of the last eight fixes, three were custom-element upgrade/flush-timing bugs, one a docs-canon binding bug across 26 files, two broken guards.

The elements cannot be exercised outside a browser. happy-dom fails in `connectedCallback`; the six anchored overlays open only on the native popover `toggle` event; c-dropdown is a `showModal()` dialog; field label geometry rides on `ResizeObserver` and computed `column-gap`; the peek cap bails on empty client rects; `@property` registration exists solely for real style computation. Mounting the raw SFC with `@vue/test-utils` is unfaithful too: `useHost()` is `null`, so every host event and `applyDefaults` resolution silently no-ops.

## Decisions

- **One runner, Vitest 5, two environments.** A Chromium project (via `@vitest/browser-playwright`) for anything that touches an element; a node project for pure helpers and the API snapshot. Specs compile SFC **source** through the same SFC plugins as the build (`vite.plugins.ts`), in dev-mode Vue so warnings are observable and fail tests. One dist smoke imports the built bundle to catch bundling-only faults.
- **Specs are colocated with the SFC** and excluded from the type-emitting build. A missing spec is visible at a glance; the component directory stays the one place everything about an element lives.
- **Conformance over enumeration.** A shared feature is checked on every tag of the kind it touches; kinds are derived from generated data (`migratedTags`, a generated `VALUE_TAGS`, a runtime `[popover]` probe), never a hand list, so a new component is enrolled the day it is registered.
- **Visual baselines are authored where they are reviewed** — the devcontainer — and compared in CI with a small mismatched-pixel tolerance. Fonts are made deterministic by a harness fontconfig that selects one bundled set of Liberation 2.1.5 files ahead of any system font and aliases the generic families onto it, on both machines (the distros' own Liberation copies differ in version, which moved a default input's width by 7 px). If arm64/x64 drift proves too large the screenshot path gains an arch segment; the tolerance is not raised.
- **The API snapshot complements, not replaces, the strict analyzer.** The analyzer proves the manifest is internally consistent; the snapshot proves it did not change without a reviewed diff.
- **CI gates build, lint scripts, type-check and tests together** in one workflow; `lint:tokens` becomes strict there. `lint:contrast` stays a report until the brand pairs are redesigned.
- **`playwright` is pinned to the devcontainer's baked Chromium** through the workspace catalog; a node spec fails when the Dockerfile pin drifts.

## Considered options

- **jsdom / happy-dom with `@vue/test-utils`**: fast, but cannot mount the elements or open any panel; would test an SFC shape consumers never see.
- **`@playwright/test` against static demo pages**: closest to the scratchpad harness, but a second runner and config, specs outside the component tree, no shared vite pipeline for source imports.
- **Storybook + test-runner / Chromatic**: stories as fixtures plus hosted visual review; heaviest to introduce and overlaps the docs example system (ADR-0012/0020).
- **Web Test Runner**: web-components-native, but a separate build pipeline and no SFC or screenshot support.
- **CI as the canonical baseline environment**: deterministic, but every new baseline needs a CI round-trip to review.
- **Bundling a test font / per-arch baselines**: the fontconfig alias achieves determinism without shipping a font or doubling PNGs.

## Consequences

- `pnpm test` exists at the root; `pnpm build` precedes it for the dist and example smokes.
- Every `Fix(` PR carries a behaviour spec that fails before the fix; every new component ships a spec and a visual baseline per theme mode (CLAUDE.md). Conformance suites enrol new tags automatically — fix the component, never opt out.
- `tsconfig.build.json` excludes `src/**/*.spec.ts` and `src/test/**`; `tsconfig.json` gains the browser matcher types and type-checks specs with the components.
- The docs package gains a Vitest project and `@vitejs/plugin-vue`; canons are now executed, not only parsed.
- Visual baselines are compared only on Linux — the devcontainer and CI, where the fontconfig pins the glyphs. On another host (a macOS checkout) the visual step of a spec is skipped and its behaviour assertions still run; `test:update` cannot write a baseline there.
- `src/tag-name-map.ts` gains a second value export, `VALUE_TAGS`.
