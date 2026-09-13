# Plan: introduce automated tests to csc-ui

## Context

Components in `packages/csc-ui` break when new features land. Today the only gates are static: `vue-tsc`, the strict analyzer (`docs:manifest:strict`), five orphaned `lint:*` scripts and the docs example-parity check. Nothing renders a component. No CI workflow builds, lints or tests a PR — `changeset-check.yml` only looks for a changeset file.

The evidence for what breaks (last eight `Fix(` commits):

- Three were custom-element **upgrade / flush-timing** bugs in a real browser: c-autocomplete option content (`2d3d34b3`), c-modal initial focus (`5e501b96`), the peek cap measuring outgoing rows (`8ef62d16`).
- One was value-resolution logic in c-select (`d54ae8a9`); one a contrast hole in the token matrix (`eabb9fa1`).
- Two were **broken guards**: eslint-config-prettier ordering (`651a2f68`) and the changeset check accepting edits (`e8d275b5`).
- One was 52 dead `.prop` bindings across 26 docs canons (`7879289d`) — a rendered-example smoke would have caught all of them at once.

The project already writes its assertions — as prose. 26 of 31 plans in `_plan/` carry a `## Verification` section describing a throwaway raw-CDP Chromium harness rebuilt per feature and never committed (`_plan/app-defaults.md:211`: "Verification (no test runner exists; gates are the builds)"). `_plan/tree-select-component.md:76` already pre-decided: "A committed test harness (vitest browser mode) is a separate plan + ADR." This is that plan.

Why a real browser, not a DOM shim: happy-dom cannot mount the elements (`_inheritParentContext` reads `provides` of `null` in `connectedCallback`); every anchored overlay (`c-autocomplete`, `c-tree-select`, `c-menu`, `c-menu-item`, `c-tooltip`, `c-popover`) sets `isOpen` only from the native popover `toggle` event (`src/shared/useAnchoredPanel.ts:148`); c-dropdown's panel is a `<dialog>` opened with `showModal()` (`CDropdown.vue:561`); field label geometry rides on `ResizeObserver` + `getComputedStyle().columnGap` (`CInput.vue:479, 538–547`); `peekCap` bails when `getClientRects()` is empty. Mounting the raw SFC with `@vue/test-utils` is unfaithful too: `useHost()` is `null`, so host events and `applyDefaults` resolution silently no-op. The devcontainer already bakes Chromium 1223 into `/ms-playwright` "for headless Playwright runs (component e2e / visual checks)".

The Stencil-era 3.x suite (100 spec + snapshot files, 282 screenshot-cache entries) was deleted wholesale by the 4.0 rewrite commit `84882b8b`; nothing replaced it.

## Decisions (grilling session, 2026-09-13)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Breakage classes covered from day one | Interaction behaviour **and** public API surface **and** visual rendering |
| 2 | Runner | **Vitest 5.0.0** browser mode via `@vitest/browser-playwright@5.0.0` on Chromium; a `node` project for pure code |
| 3 | Subject under test | SFC **source** through the build's SFC plugins, plus **one dist smoke** on `dist/csc-ui.js` |
| 4 | Spec location | **Colocated**: `src/components/c-select/CSelect.spec.ts` beside the SFC and `usage.md` (ADR-0026) |
| 5 | Extra layers in iteration 1 | **Conformance suites** + **Example smoke**. Deferred: guard tests of the lint scripts, React wrapper smoke |
| 6 | Visual baselines | Authored in the **devcontainer**, committed beside specs, **CI compares with tolerance**; one PNG per theme mode |
| 7 | CI | New `ci.yml`: build + lint scripts + type-check + tests. `lint:tokens` becomes `--strict` (passes today). `lint:contrast` runs **non-strict, report only** — its 10 failing pairs are brand colours (white on accent/success/warning …) and design-owned |
| 8 | First hand-written specs | **Regression-seeded panel family**: c-select, c-autocomplete, c-tree-select, c-modal, c-dropdown/c-menu peek cap, applyDefaults |
| 9 | Policy (CLAUDE.md) | Every `Fix(` PR adds a behaviour spec that fails before the fix; every new component ships a colocated spec + visual baseline; conformance suites enrol tags automatically. Review-enforced |
| 10 | Glossary | New `### Verification` section: Behaviour spec, Conformance suite, Example smoke, API snapshot. **Value control** (existing phrase) is defined; "value component" goes on its avoid list |
| 11 | ADR | One ADR-0049 in ADR-0048's shape |
| 12 | Font determinism | A harness `fonts.conf` aliases `sans-serif`/`system-ui`/`ui-sans-serif`/`museo-sans` to **Liberation Sans** via `FONTCONFIG_FILE` (locally `sans-serif` → WenQuanYi Zen Hei, on ubuntu → DejaVu Sans; Liberation is installed on both by `playwright install --with-deps`) |

Assumptions made without asking (flag if wrong):

- Browser specs use the plain `*.spec.ts` suffix; node specs `*.node.spec.ts`.
- Example smoke lives in `packages/csc-ui-documentation` as its own Vitest project and registers csc-ui from the **built** `@cscfi/csc-ui` (CI builds first; locally `pnpm build` or `build:watch`).
- `playwright` is pinned to **1.60.0** (the baked `chromium-1223`) through a pnpm **catalog**; a node spec fails when the Dockerfile pin drifts.
- Conformance suites live in `src/test/conformance/` (not colocated — they span all tags).
- csc-ui's ESLint has ~6k errors today, so ESLint stays out of the CI gate (follow-up).
- Each step ships with `pnpm changeset --empty` (tooling, not user-facing).

## Glossary additions (CONTEXT.md — new `### Verification` after `### Documentation`, before `### Flagged ambiguities`)

```md
### Verification

**Behaviour spec**:
A browser test colocated with one component (`C<Name>.spec.ts` beside the SFC) asserting that component's interaction contract — keyboard, focus, value events, ARIA, upgrade timing — against the registered custom element, never a mounted SFC.
_Avoid_: unit test, e2e test, component test (ambiguous between the two)

**Conformance suite**:
A parametrised browser test that runs the shared contract of one component *kind* over every tag of that kind, enrolling tags automatically from generated data rather than a hand-kept list. Kinds: all components, **value controls**, anchored overlay components.
_Avoid_: contract test, shared spec, generic test

**Value control**:
A component that holds a persistent `value` and reports changes through the value events (`update:value` with its `changeValue`/`change` siblings and a bubbling `input`) — the population a plain Vue `v-model` binds to. Emission happens only on user interaction, never when `value` is set programmatically. Includes the **value-selection** fields, the selection controls, `c-text-field`, `c-slider`, `c-tabs`, `c-button-group`, `c-accordion`, `c-modal`, `c-pagination`, `c-otp-input`.
_Avoid_: value component, form control (a `c-button` is a control but holds no value), input

**Example smoke**:
The browser run that mounts every canon example from the docs site once and asserts a clean upgrade — no console error or warning, every `c-*` descendant defined. It asserts nothing about behaviour; the canons are fixtures, not specs.
_Avoid_: docs test, example test, smoke test (unqualified)

**API snapshot**:
The committed, condensed rendering of the **manifest** (per tag: props, events, methods, slots, parts, states) that a node spec diffs the freshly generated manifest against, so an unintended public-API change fails a test instead of silently changing `custom-elements.json`. The strict analyzer checks the manifest is *consistent*; the API snapshot checks it is *unchanged*.
_Avoid_: golden file, manifest snapshot, API baseline
```

Reserved words kept away from tests: **canon** (docs example), **parity** (ramp/chart/example parity scripts), **guard** (the palette grep), **validation** (the consumer's job, per **Error message**).

## ADR-0049 (`docs/adr/0049-component-tests-run-in-a-real-browser.md`)

```md
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
- **Visual baselines are authored where they are reviewed** — the devcontainer — and compared in CI with a small mismatched-pixel tolerance. Fonts are made deterministic by a harness fontconfig that aliases the generic families to Liberation Sans on both machines. If arm64/x64 drift proves too large the screenshot path gains an arch segment; the tolerance is not raised.
- **The API snapshot complements, not replaces, the strict analyzer.** The analyzer proves the manifest is internally consistent; the snapshot proves it did not change without a reviewed diff.
- **CI gates build, lint scripts, type-check and tests together** in one workflow; `lint:tokens` becomes strict there. `lint:contrast` stays a report until the brand pairs are redesigned.
- **`playwright` is pinned to the devcontainer's baked Chromium** through the workspace catalog; a node spec fails when the Dockerfile pin drifts.

## Considered options

- **jsdom / happy-dom with `@vue/test-utils`**: fast, but cannot mount the elements or open any panel; would test an SFC shape consumers never see.
- **`@playwright/test` against static demo pages**: closest to today's scratchpad harness, but a second runner and config, specs outside the component tree, no shared vite pipeline for source imports.
- **Storybook + test-runner / Chromatic**: stories as fixtures plus hosted visual review; heaviest to introduce and overlaps the docs example system (ADR-0012/0020).
- **Web Test Runner**: web-components-native, but a separate build pipeline and no SFC or screenshot support.
- **CI as the canonical baseline environment**: deterministic, but every new baseline needs a CI round-trip to review.
- **Bundling a test font / per-arch baselines**: the fontconfig alias achieves determinism without shipping a font or doubling PNGs.

## Consequences

- `pnpm test` exists at the root; `pnpm build` precedes it for the dist and example smokes.
- Every `Fix(` PR carries a behaviour spec that fails before the fix; every new component ships a spec and a visual baseline per theme mode (CLAUDE.md). Conformance suites enrol new tags automatically — fix the component, never opt out.
- `tsconfig.build.json` excludes `src/**/*.spec.ts` and `src/test/**`; `tsconfig.json` gains the browser matcher types and type-checks specs with the components.
- The docs package gains a Vitest project and `@vitejs/plugin-vue`; canons are now executed, not only parsed.
- `src/tag-name-map.ts` gains a second value export, `VALUE_TAGS`.
```

## Infrastructure design

Verified against the published 5.0.0 type definitions: `test.projects` accepts **container configs** (a listed file may itself declare `projects`); `browser.instances[{browser,name}]`, `provider: playwright({launchOptions, contextOptions})`, `browser.expect.toMatchScreenshot.{comparatorName, comparatorOptions:{threshold, allowedMismatchedPixelRatio}, resolveScreenshotPath}`; `vitest/browser` exports `page`, `userEvent`, `locators`; matcher types come via `@vitest/browser-playwright`. Names to re-confirm at runtime: the instance `name` yielding a project literally named `browser`; whether `screenshotOptions` (`animations:'disabled'`, `caret:'hide'`) is accepted in the config block.

### Dependencies and workspace

- `pnpm-workspace.yaml`: add a `catalog` (`vitest: 5.0.0`, `'@vitest/browser-playwright': 5.0.0`, `playwright: 1.60.0`); add `playwright: false` to `allowBuilds` (never let the install hook download a browser; devcontainer bakes it, CI installs explicitly); optionally drop the unrecognised `ignoreDepScripts` key.
- Root `package.json` devDeps: `vitest`, `playwright` (`catalog:`), `@types/node ^24` (vitest 5 peers `^22 || >=24`).
- `packages/csc-ui` devDeps: `vitest`, `@vitest/browser-playwright`, `playwright` (`catalog:`), `@types/node ^24`.
- `packages/csc-ui-documentation` devDeps: `vitest`, `@vitest/browser-playwright`, `playwright` (`catalog:`), `@vitejs/plugin-vue ^6.0.7` (already in the lockfile).
- Install with `CI=1 pnpm install --no-frozen-lockfile` from the root; commit the lockfile. No `@vitest/ui` (no display in the container).

### Configs

- **Root `vitest.config.ts`** (new): `test.projects: ['packages/csc-ui/vitest.config.ts', 'packages/csc-ui-documentation/vitest.config.ts']` — one process, one report, one `--update`, `--project` filtering.
- **`packages/csc-ui/vite.plugins.ts`** (new): exports `isCustomElement` and `sfcPlugins()` = `vue({ customElement: /\.vue$/, template.compilerOptions.isCustomElement })` + `tailwindcss()`. `vite.config.ts` replaces its two entries with `...sfcPlugins()`. Do **not** `mergeConfig(vite.config.ts)`: it carries `define NODE_ENV=production` (would silence the Vue warnings specs assert on), two `writeBundle` side-effect plugins and `build.lib`.
- **`packages/csc-ui/vitest.config.ts`** (container): `projects: ['./vitest.browser.config.ts', './vitest.node.config.ts']`.
- **`packages/csc-ui/vitest.browser.config.ts`**: `plugins: sfcPlugins()`; `define.__CSC_REQUIRE_DIST__ = Boolean(process.env.CI)`; `test.name 'browser'`, `include ['src/**/*.spec.ts']`, `exclude ['src/**/*.node.spec.ts']`, `setupFiles ['./src/test/setup.browser.ts']`, `testTimeout 15_000`; `browser: { enabled, headless, provider: playwright({ launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined, env: { ...process.env, FONTCONFIG_FILE: <src/test/fonts.conf> }, args: ['--font-render-hinting=none', '--force-device-scale-factor=1'] }, contextOptions: { colorScheme: 'light', deviceScaleFactor: 1 } }), instances: [{ browser: 'chromium', name: 'browser' }], viewport: { width: 1280, height: 800 } /* c-dropdown goes mobile ≤760px */, screenshotFailures: false, expect: { toMatchScreenshot: { comparatorName: 'pixelmatch', comparatorOptions: { threshold: 0.2, allowedMismatchedPixelRatio: 0.01 }, resolveScreenshotPath: <root/testFileDirectory/__screenshots__/testFileName/`${arg}-${browserName}${ext}`> /* drop platform; append process.arch later if needed */ } } }`.
- **`packages/csc-ui/vitest.node.config.ts`**: `name 'node'`, `environment 'node'`, `include ['src/**/*.node.spec.ts']`.
- **`packages/csc-ui-documentation/vitest.config.ts`** (Nuxt-free): `vue({ template.compilerOptions.isCustomElement })` + `ignoreExampleDocsBlocks` extracted from `nuxt.config.ts` (~lines 70–77) into `scripts/ignore-example-docs-blocks.mjs` and imported by both; `name 'examples'`, `include ['tests/**/*.spec.ts']`, `setupFiles ['./tests/setup.ts']` (imports `@cscfi/csc-ui/css/tokens.css`, calls `defineCustomElements()` from the built package), same browser block, `instances: [{ browser: 'chromium', name: 'examples' }]`. Files under `tests/` (outside Nuxt's `app/` and outside the parity walk) plus a `tests/tsconfig.json` for editor typing.

### Shared harness `packages/csc-ui/src/test/`

- `setup.browser.ts`: imports `../styles/css/tokens.css` (generated by `style-dictionary:build`, which the `test` script runs first) and `harness.css` (`body { margin:0; padding:16px; background: var(--c-surface); color: var(--c-on-surface) }`); `beforeEach`: `setThemeMode('light')`, start the Vue-warning spy; `afterEach`: `document.body.replaceChildren()`, `resetDefaults()` (`src/shared/appDefaults.ts:125`), `resetTheme()`, assert no unexpected `[Vue warn]` (specs that expect a warning consume it via `vueWarnings.expect(/…/)`). **Registration is lazy** — the setup must not call `defineCustomElements()`: the dist smoke needs a clean registry and pre-upgrade-window specs need unregistered tags. `mount()` registers idempotently; hand-built DOM calls `defineAll()`.
- `harness.ts` API: `defineAll` (re-export of `defineCustomElements`), `TRANSITION_MS = 350`, `nextFrame()`, `settle(ms=0)` (two rAF + optional wait), `settled()` (= settle(350)), `setThemeMode(mode)` (sets `<html data-theme>`; reuse `ThemeMode` from `src/theme/themeMode.ts`), `mount(tag, { attrs, props, html, stage })` → `{ host, stage, shadow(sel), shadowAll(sel), part(name), deep(...selectors), unmount() }` — creates the element, sets attrs/innerHTML/props **before** connect, appends inside a `<div data-stage style="display:inline-block;padding:8px">` (hosts are `display:contents`, so the stage is the screenshot target), awaits `whenDefined` + `settle()`; `recordEvents(target, names)` → `{ events, names(), details(), last(), clear(), stop() }` capturing `detail`, `composed`, `bubbles` and `hostValueAtDispatch`; `matchScreenshotInBothModes(target, name)` → for each mode: `setThemeMode`, `settled()`, `expect.element(locator).toMatchScreenshot(`${name}-${mode}`, { screenshotOptions: { animations:'disabled', caret:'hide' } })`.
- `fonts.conf`: includes `/etc/fonts/fonts.conf`, then `match target="pattern"` rules prepending **Liberation Sans** for `sans-serif`, `system-ui`, `ui-sans-serif`, assigning it for `museo-sans`, and **Liberation Mono** for `monospace`. Verify: `FONTCONFIG_FILE=… fc-match sans-serif` → `LiberationSans-Regular.ttf`.
- `globals.d.ts`: `declare const __CSC_REQUIRE_DIST__: boolean`.
- `dist-smoke.spec.ts`: `import.meta.glob('../../dist/csc-ui.js')` (empty when unbuilt) → `describe.skipIf(!load && !__CSC_REQUIRE_DIST__)`; asserts built-in-CI, clean registry, every `migratedTags` entry upgrades after `defineCustomElements()`, idempotent second call, public exports present (`defineCustomElements, applyTheme, resetTheme, themeToCss, applyDefaults, resetDefaults, themeMode, migratedTags, DEFAULT_SEEDS, FAMILIES, DEFAULTABLE_PROPS, chartSlots…`), exactly one `style[data-csc-ui-tw-properties]` in `document.head` after 20 connects (`defineElement.ts:46–64`), two `c-button`s share `adoptedStyleSheets[0]` and a `c-switch` adds exactly one SFC sheet, no `<style>` in any shadow root (the temporary spec from `_plan/share-styles-via-adopted-stylesheets.md` made permanent), `tokens.css` `--c-surface` differs between modes, `applyTheme({primary:'#ff0000'})` moves `--c-primary-500` and `resetTheme()` restores. Per-file iframe isolation keeps source and dist registries apart.
- `toolchain.node.spec.ts`: the Dockerfile's `npx -y playwright@X install` version equals `require('playwright/package.json').version`.
- `conformance/` — see Test content.

### tsconfig, scripts, misc

- `tsconfig.json`: `lib` → ES2022; `types: ["vite/client", "@vitest/browser-playwright"]`; `include` adds `vite.plugins.ts`, `vitest.config.ts`, `vitest.*.config.ts`. One config so `type-check` covers specs and harness. (Fallback if `expect.element` matchers don't type: add `@vitest/browser` and `@vitest/browser/matchers` to `types`.)
- `tsconfig.build.json`: `types: ["vite/client"]`; `exclude: ["vite.config.ts", "src/**/*.spec.ts", "src/**/*.spec.d.ts", "src/test/**"]`. Verify no `*.spec.d.ts` / `dist-types/test` after `build:types`.
- `scripts/copy-styles.d.ts` (one line) makes `type-check` green (`vite.config.ts(7,28) TS7016` today).
- csc-ui scripts: `test` = `pnpm run style-dictionary:build && vitest run`; `test:watch`; `test:browser` / `test:node` (`--project`); `test:update` (`--project browser --update`); `lint` = tokens (`--strict`) + a11y + ramp + chart; `lint:tokens` gains `--strict`. Docs: `test` = `vitest run`. Root: `test`, `test:watch`, `test:update`. Add `.vitest-attachments/` to `.gitignore`.
- Devcontainer: Dockerfile comment points at the catalog pin and the toolchain spec; `.devcontainer/.zsh/.zshrc` gets `ulimit -c 0` (SIGKILLed Chromium otherwise dumps `core` into cwd).

### `.github/workflows/ci.yml`

`on: pull_request` (unfiltered so PRs into `development` run too) + `push: branches: [main]`; `concurrency` per ref; `ubuntu-latest`, 30 min. Steps: checkout → `corepack enable` → setup-node 24 with pnpm cache → `pnpm install --frozen-lockfile` → build csc-ui → build csc-ui-react → csc-ui `lint` → csc-ui `type-check` → `lint:contrast` with `continue-on-error: true` → docs `lint` → docs `lint:examples` → read playwright version → cache `~/.cache/ms-playwright` keyed on it → `pnpm exec playwright install --with-deps chromium` → `pnpm test` → on failure upload `packages/**/.vitest-attachments/**`. `changeset-check.yml` untouched.

## Test content design

Facts every assertion respects: hosts are `display: contents` (`src/tailwind.css:187–189`) unless the SFC overrides (`c-radio`, `c-tab`, `c-menu-item`, `c-select`, `c-tree-select`, `c-text-field`, `c-otp-input` block; `c-checkbox`, `c-switch` inline-block; `c-radio-group` flex; `c-tabs` grid) → click inner controls, not zero-rect hosts. Native `<input>` `input` events are `composed`, so a host listener hears **two** `input`s per keystroke — assert on the one with `composed === false` (the library's, `emitModelValue.ts:41`). Opens are rAF-deferred → always `settle()` before reading focus/highlight. Live-region text debounces 1400 ms → read `data-active`/index instead. Wait ≥350 ms before colour reads and screenshots (`transition-colors duration-300`). Escape routing: popover chain (capture) → overlay hosts → modal stack (skips `defaultPrevented`).

### Conformance suites — `src/test/conformance/`

`kinds.ts` holds the per-tag fixture table (`FIXTURES[tag]`, each entry commented with the warning it prevents: c-modal `aria-label`, c-popover `heading`, c-icon `path`, c-menu-item a `slot="submenu"` child), `VALUE_RECIPES`, `OVERLAY_RECIPES`, `NO_ROOT_PART`, `KNOWN_PROGRAMMATIC_EMITTERS`.

**Derivation.** (a) all components = `migratedTags` (`src/index.ts:369`); companion `src/index.node.spec.ts` asserts `readdirSync('src/components')` equals the tag set and the registration-order invariants commented in `index.ts:271–354` hold. (b) value controls = a new generated `VALUE_TAGS` const in `src/tag-name-map.ts`, emitted by `scripts/analyzer/tag-map.mjs` next to `DEFAULTABLE_PROPS` (~lines 325–360): tags whose event map has `update:value` (14 today: c-accordion, c-autocomplete, c-button-group, c-checkbox, c-modal, c-otp-input, c-pagination, c-radio-group, c-select, c-slider, c-switch, c-tabs, c-text-field, c-tree-select); the suite asserts `Object.keys(VALUE_RECIPES)` equals `VALUE_TAGS` so a new value control without a recipe fails loudly. (c) anchored overlays = runtime probe: mount each tag's fixture, `shadowRoot.querySelector('[popover]') !== null` (expected: c-autocomplete, c-tree-select, c-menu, c-menu-item, c-tooltip, c-popover; c-select is a dialog, deliberately absent); assert the probed set equals `Object.keys(OVERLAY_RECIPES)`.

**`all-components.spec.ts`** (`describe.each(migratedTags)`, ~6 × 72): upgrades (`customElements.get`, `:defined`, shadowRoot); mount + settle + remove with zero `console.error/warn`; `[part~="root"]` present except for `NO_ROOT_PART` (c-autocomplete, c-dropdown, c-login-buttons, c-menu, c-option, c-option-value, c-page, c-popover, c-select, c-table, c-tabs, c-text-field, c-tooltip, c-tree-select — the c-input-wrapping fields and slot-only elements) with the inverse asserted so the list cannot rot; host `role`/`tabindex`/`id` not duplicated onto the root part (runtime twin of `check-host-attr-fallthrough.mjs`); `adoptedStyleSheets.length >= 1` and no `<style>` in the shadow root; `getComputedStyle(host).display` is `contents` unless the SFC overrides.

**`value-controls.spec.ts`** (`describe.each(VALUE_TAGS)`, 4 × 14). Recipes (verified against handlers):

| tag | fixture | interaction | expected `update:value` | notes |
|---|---|---|---|---|
| c-checkbox | `props:{label}` | click `label[part=label]` (`CCheckbox.vue:23`) | `true` | `:state(checked)` after |
| c-switch | `props:{label}` | click `label[part=root]` | `true` | |
| c-radio-group | two `<c-radio value>` | click 2nd `c-radio` host | `'b'` | group syncs on double rAF |
| c-select | 3 `<c-option>` (no `selected`) | click `input[role=combobox]` → settle → click 1st `li[role=option]` in the c-dropdown shadow | `'fi'` | `<c-option selected>` emits at mount (`CSelect.vue:1385–1391`) — pinned as `it.fails` in CSelect.spec |
| c-text-field | `props:{label}` | `userEvent.type(input, 'a')` | `'a'` | composed twin |
| c-slider | `min 0, max 10, value 5` | focus range input, ArrowRight | `6` | |
| c-tabs | two `<c-tab value>`, `value:'one'` | click 2nd `c-tab` host | `'two'` | |
| c-button-group | two `<c-button value>` | click inner `button` of 2nd | `'b'` | `emitModelChange` (`change`, no `changeValue`) |
| c-accordion | two `<c-accordion-item>` | click `button[part=header]` in item 1's shadow | `'a'` | |
| c-modal | `value:true, dismissable`, `aria-label`, a `c-button` child | Escape | `false` | programmatic `host.value=true` opens with zero events |
| c-pagination | `value:{itemCount:100,currentPage:1,itemsPerPage:25}` | click inner button of `c-icon-button[aria-label="Next page"]` | object with `currentPage:2` | **known deviation**: emits on mount and on programmatic change (`CPagination.vue:425–434`) → in `KNOWN_PROGRAMMATIC_EMITTERS`, inverse asserted so fixing it forces the list to shrink |
| c-otp-input | `length:1` | type `'1'` into `input[part=input]` | `'1'` | emits inside rAF; `host.value` written after `update:value` (`COtpInput.vue:296–319`) → check at `input` |
| c-tree-select | `items:[{value:'a',name:'A'},…]` | click combobox → settle → click 1st `li[part=item]` | `'a'` | `emitModelChange`; focus returns to combobox |
| c-autocomplete | 3 `<c-option>` | click combobox → settle → click 1st `li[part=item]` | `'fi'` | + bubbling `change` |

`it`s: (1) programmatic `host.value = …` emits nothing after `settle()` + 60 ms (`emitModelValue.ts:20–23`); (2) one interaction → exactly one `update:value`, one non-composed `input` (recorded on `document.body`, bubbles), `hostValueAtDispatch` equals `detail`, plus `changeValue` + `change-value` once (emitModelValue tags) or `change` once (emitModelChange tags); (3) `''` and `null` read as empty on the c-input fields and c-text-field — nested `c-input` label lacks `data-lifted` (`CInput.vue:50`), no clear button with `clearable`; c-text-field treats `0` on `type=number` as filled (`CTextField.vue:463–465`); (4) a `createApp` with `v-model="m"` (`m = ref(null)`) mounts with zero events, `host.value === ''` yet the field reads empty, and the recipe writes the ref.

**`anchored-overlays.spec.ts`** (`describe.each(OVERLAY_RECIPES)`, ~6 × 6): opens via its trigger (`panel.matches(':popover-open')`); trigger ARIA (`aria-haspopup`/`aria-expanded`, tooltip's `aria-description` on the slotted trigger, popover panel `role=dialog aria-label`); closes on Escape; light-dismiss on outside `pointerdown` (skipped for tooltip; tooltip hides on hover-out and Escape **without** moving focus); focus returns to the trigger on Escape close (popover only when focus was inside); `host.remove()` while open leaves no `:popover-open` in the document and a following document `pointerdown` throws nothing (`useAnchoredPanel.ts:166–173`). c-menu-item: Escape closes only the submenu and focuses the parent item. c-popover extra: nested inner popover — Escape peels the inner first (ADR-0038).

### Regression-seeded behaviour specs (colocated)

- **`c-select/CSelect.spec.ts`** — fixture: four `<c-option name value>`, `props:{label, clearable}`; rows = `li[role="option"]:not([data-select-all])` in the c-dropdown shadow; open = `ul[part=list].active` + `dialog[part=menu].open`. `it`s: picked row carries `svg.check` and `aria-selected="true"`, others not (`CDropdown.vue:76, 97–105`) — **screenshot** `open-checked`; scalar `value='se'` → combobox `.value === 'Sweden'`, `<c-option value=se>.selected`, `c-dropdown.selected` deep-equals `['se']`; `it.each(['field click','chevron','keyboard'])` seeds `c-dropdown.index === 1` and keeps DOM focus on the combobox; one ArrowDown focuses row 2; Escape closes + refocuses, `defaultPrevented` only while open (`CSelect.vue:1173–1185`); clear button and `reset()` emit `null` once; `it.fails` for `<c-option selected>` mount emission; `describe('multiple')`: `aria-multiselectable`, select-all tri-state `part=indicator/mark`, two picks → two `c-tag[part=tag]` and `'Finland, Sweden'`, `max-tags="1"` → `+1 more`, `max-tags="0"` → `'2 selected'`, ArrowUp from row 0 → select-all → closes, Space/Enter toggle, Backspace removes last pick, tag × removes and refocuses — **screenshot** `multiple-open-indeterminate`; peek re-cap: `items-per-page=3`, append a tall `<c-option>` at index 1 while open → after one rAF the cap equals the new `midpoint(rows[3])` (the `flush:'post'` regression, `CDropdown.vue:846–857`).
- **`c-autocomplete/CAutocomplete.spec.ts`** — nested `<c-option-value>` + `<c-icon>` (path set as a property before insert) renders in rows on **first** open (`2d3d34b3`, observer `attributes:true` `:1673–1680`); `option.disabled = true` → row `aria-disabled`; query `ja` marks `mark[part=match]` only inside the label region, description unmarked; `(`, `c++`, `[\` throw nothing (`splitMatches.ts`) — **screenshot** `open-marked`; `multiple`: panel stays open, DOM focus in the search input, `aria-activedescendant` walks select-all → options, Enter on select-all toggles all listed enabled options, `return-object` shape; `change:query` `''` on every open and once per keystroke (count non-composed `input`); external mode keeps committed labels across an `items` swap, `li[part=info]` loading row; peek: `items-per-page=3` with 8 options caps at `midpoint(rows[3])` and clears after filtering to 2.
- **`c-tree-select/CTreeSelect.spec.ts`** (the 127-check smoke made permanent) — opens on click/ArrowDown/Enter/Space, not on bare focus; browse one level with `nav[part=breadcrumb] button[part=crumb]` and `Step 2 of 3` header; commit a leaf → `change` detail, `update:value`, one `input`, panel closed, combobox focused, `.value === 'Natural sciences › Mathematics › 1111 Pure mathematics'`; crumbs / ArrowLeft / Backspace-in-empty-query climb, ArrowRight descends; reopen lands on the committed item's level with it selected + `data-active`; `return-object` → `{value,name,code,path[]}` without `children`; search lists whole-tree matches with `[part=path]` and marks, `Browse instead` returns; `allow-branch` pinned `li[data-select-branch]` commits on Enter and Home; disabled branches not enterable; clear → `null` once, panel closed; `''` normalises to empty; peek re-caps on level change; uneven tree drops the counter and says `Final level` — **screenshots** `open-level2-committed`, `search`.
- **`c-modal/CModal.spec.ts`** (emulate reduced motion or await `animationend`) — opened at mount focuses the first focusable after slotted elements upgrade (`5e501b96`, `scheduleInitialFocus` rAF `CModal.vue:230–240`), `[autofocus]` wins; no focusables → `dialog[part=root]` focused with `outline-style: none` — **screenshot** `open`; `dismissable`: Escape and backdrop click close and emit `false` once; non-dismissable nudges (`.nudging` within 150 ms), no events; two modals: only the top backdrop has opacity 1, siblings `inert` except `c-toasts`, `documentElement.style.overflow === 'hidden'`, Escape closes only the top, focus restores to the opener; `console.warn` once without an accessible name; native `close` converges (`onNativeClose`).
- **`src/shared/peekCap.spec.ts`** (browser, pure geometry) — `null` when content fits; 8 × 40 px rows with `itemsPerPage=3` → `round(midpoint(rows[3]))`; mixed heights with labels/dividers snap to the last **row** midpoint under the ceiling; border-box vs content-box; `applyPeekCap` clears inline `maxHeight` before reading the stylesheet ceiling. **`c-menu/CMenu.spec.ts`** (viewport 1200×400 so `max-h-[80vh]` = 320 px) — 30 items: `list.style.maxHeight` set, list bottom falls strictly inside an item rect, `scrollbar-width: none` — **screenshot** `open-peek`; interleaved `c-menu-label`/`c-divider` never take the cut; appending 5 items while open re-measures after one rAF.
- **`src/shared/appDefaults.node.spec.ts`** — unknown tag throws `/has no defaultable props/`, non-defaultable prop throws `/is not a defaultable prop/`, valid input without `document` returns; `Object.keys(DEFAULTABLE_PROPS)` is exactly `c-autocomplete, c-data-table, c-select, c-text-field, c-tree-select`. **`src/shared/appDefaults.spec.ts`** (browser, `_plan/app-defaults.md:214–224`) — unset → built-in, no reflected attribute; `applyDefaults` flips a mounted field live (`c-input` gains `label-on-top`); explicit attribute/property beats the app default, `undefined` falls back; undefined key clears, `resetDefaults` restores; `hide-details` reaches `c-input` via `data-hide-details` across value changes; `texts` merge per key (`aria-label="Vaihda"`).
- **`src/shared/emitModelValue.spec.ts`** — dispatch order, `host.value` written before any event, identity guard, `emitModelChange` triple.

### API snapshot — `src/api-snapshot.node.spec.ts`

`scripts/analyzer/index.mjs` is CLI-only (top-level from `:161`, `process.argv` at `:48`). Phase 1: `beforeAll` runs `execFileSync(process.execPath, ['scripts/analyzer/index.mjs'])` (non-strict, ~1–2 s, writes `dist/custom-elements.json` from **source**). Later refactor: extract `runAnalyzer({strict, only, write})` into `scripts/analyzer/run.mjs` and call it with `write:false`. Shape: one `toMatchFileSnapshot` per tag → `src/components/<c-tag>/api.snapshot.json` (a PR touching one component shows one diff beside its SFC; a single 72-tag `.snap` would be a conflict magnet). Descriptions excluded (prose churn ≠ API change); keys sorted; compact strings, e.g. `"attributes": { "hide-details": "boolean = false" }`, `"props"`, `"propertyOnly"`, `"defaultable"`, `"events": { "update:value": "CustomEvent<boolean | number | string>" }`, `"methods": { "reset": "()" }`, `"slots"`, `"parts"`, `"states"`, `"cssProperties"`, `"subcomponents"`. Plus `src/api.entry.snapshot.json`: sorted runtime export names of `src/index.ts` and the manifest's `csc.types[]` with owners. Guards: snapshot-file count equals manifest declaration count and no orphan `api.snapshot.json`; `NO_ROOT_PART` equals tags whose `cssParts` lack `root`; `DEFAULTABLE_PROPS` equals the `csc.defaultable` members. Update with `pnpm ui test:node -u`; CI runs without `-u`.

### Example smoke — `packages/csc-ui-documentation/tests/examples.spec.ts`

`import.meta.glob('../app/examples/*/*.vue')` (122 canons; same glob as `app/composables/useExamples.ts:37`). Per canon: `createApp(Canon)` with `warnHandler`/`errorHandler` collecting; mount into a fresh `<div>`; `settle()` + 700 ms (two timer-driven canons: `c-autocomplete/external.vue` 300 ms debounce, `c-data-table/external-data.vue` 600 ms; no canon uses fetch/router). Assert: collected warnings empty; every light-DOM `c-*` descendant `matches(':defined')` with a `shadowRoot`; `Object.getOwnPropertyNames(el).filter(k => k.includes('-'))` empty on every `c-*` (the dead `el['level-labels']` class of bug, runtime twin of the parity check's `.prop` rule); teardown `app.unmount()`, no `:popover-open` left, `documentElement.style.overflow === ''`. Screenshots: a curated ~12-canon subset × 2 modes (c-button, c-checkbox, c-radio-group, c-switch, c-select closed, c-tree-select closed, c-alert, c-card, c-data-table, c-tabs, c-progress-bar, c-tags basics), not 122 × 2.

## Implementation sequence

Each step is one commit/PR on `development` with `pnpm changeset --empty`.

1. **Docs + harness (ADR-0049).** Copy this plan to `_plan/component-tests.md`. Write ADR-0049, the CONTEXT.md `### Verification` section, CLAUDE.md (Commands: `pnpm test`, `test:watch`, `test:browser`, `test:node`, `test:update`, `lint`; Conventions: the policy from decision 9 and "run `test:update` in the devcontainer, review PNG diffs, commit"). Workspace catalog + `allowBuilds`; deps; `vite.plugins.ts` + `vite.config.ts` refactor; the three csc-ui vitest configs; `src/test/{setup.browser.ts, harness.ts, harness.css, fonts.conf, globals.d.ts, dist-smoke.spec.ts, toolchain.node.spec.ts}`; tsconfig edits; `scripts/copy-styles.d.ts`; scripts; `.gitignore`; Dockerfile comment + `.zshrc` `ulimit -c 0`; root `vitest.config.ts`; a proof spec `c-button/CButton.spec.ts` with two baselines.
2. **CI gate.** `ci.yml`, csc-ui `lint` aggregate, `lint:tokens --strict`. Green on step 1's harness alone; every later step is gated.
3. **Conformance + snapshot.** `VALUE_TAGS` in `tag-map.mjs` (regenerate, commit `tag-name-map.ts`); `src/test/conformance/{kinds.ts, all-components.spec.ts, value-controls.spec.ts, anchored-overlays.spec.ts}`; `index.node.spec.ts`; `emitModelValue.spec.ts`; `appDefaults.node.spec.ts`; `api-snapshot.node.spec.ts` + 72 `api.snapshot.json` + `api.entry.snapshot.json`. Expect the c-pagination mount emission to surface — pin it, do not fix it here.
4. **Regression-seeded specs, wave 1.** `CSelect.spec.ts`, `CModal.spec.ts`, `peekCap.spec.ts`, `CMenu.spec.ts` (the three most recent regressions), with baselines.
5. **Regression-seeded specs, wave 2.** `CAutocomplete.spec.ts`, `CTreeSelect.spec.ts`, `appDefaults.spec.ts`, with baselines.
6. **Example smoke.** Docs deps, `scripts/ignore-example-docs-blocks.mjs` extraction (nuxt.config.ts imports it), docs `vitest.config.ts`, `tests/{setup.ts, examples.spec.ts, tsconfig.json}`, root `projects` entry, curated screenshot subset.

Follow-ups recorded, not in scope: guard tests of the lint scripts; React wrapper smoke; `runAnalyzer` extraction; csc-ui ESLint debt (~6k errors) before ESLint can join CI; per-arch baselines only if tolerance proves insufficient.

## Verification

1. `CI=1 pnpm install --no-frozen-lockfile`; `pnpm ui exec vitest list` shows projects `browser` and `node`; root `pnpm exec vitest list` adds `examples` after step 6.
2. `FONTCONFIG_FILE=packages/csc-ui/src/test/fonts.conf fc-match sans-serif` → `LiberationSans-Regular.ttf`.
3. Proof spec: `mount('c-button', { html: 'Save' })` → shadowRoot present, `adoptedStyleSheets.length >= 1`, `part('root')` has a non-transparent background after `settled()`, `document.head` contains `style[data-csc-ui-tw-properties]` (proves the serve-mode Tailwind `?inline` string still carries `@property` blocks). `pnpm ui test:update` writes two PNGs under `src/components/c-button/__screenshots__/CButton.spec.ts/`; `pnpm ui test:browser` passes.
4. Gate proof: a temporary `expect(1).toBe(2)` exits 1; a temporary `applyTheme({ primary: '#ff0000' })` before the screenshot fails with a diff in `.vitest-attachments/`; revert both.
5. `pnpm ui build:types` emits no `*.spec.d.ts` and no `dist-types/test`; `pnpm ui type-check` and `pnpm ui lint` green.
6. `pnpm ui build` then `pnpm ui test:browser` → dist smoke passes; `rm -rf packages/csc-ui/dist` → skips locally, `CI=1 pnpm ui test:browser` fails on "is built".
7. After step 3: `pnpm ui test` runs ~500 conformance assertions; the API snapshot writes 73 files on first `-u` and passes clean on the second run; deleting one `api.snapshot.json` fails the count guard.
8. After steps 4–5: the seeded specs pass; reverting `d54ae8a9`'s c-select change locally makes the check-mark spec fail (proves the regression is caught).
9. After step 6: `pnpm --filter @cscfi/csc-ui-documentation test` → 122 canons green; re-adding one `.prop` binding to a canon fails the own-property assertion.
10. Open a PR → `CI` green; push a temporary failing assertion → red; revert. Confirm the toolchain spec fails when the Dockerfile pin is edited.

## Deviations pinned by the conformance suites (2026-09-13)

Each is asserted in the inverse so that fixing the component forces the list in `src/test/conformance/kinds.ts` to shrink. A fix ships with the spec going green (CLAUDE.md policy).

- **c-pagination emits on mount and on programmatic `value` change** (`KNOWN_PROGRAMMATIC_EMITTERS`): `onMounted → setRange()` and the `value` watch both dispatch the value events, against the "emit only on interaction" contract.
- **c-checkbox / c-switch mount checked from a `null` v-model** (`KNOWN_EMPTY_VALUE_CHECKED`): `vModelText` writes `''` for a null model and Vue casts `''` to `true` for a prop typed `boolean | number | string`, so `'' === trueValue` and the control reads as checked. `''` must read as empty (glossary, **Value control**).
- **c-modal dispatches the value events twice per dismissal and once on a programmatic close** (`KNOWN_DOUBLE_EMITTERS`, `KNOWN_PROGRAMMATIC_EMITTERS`, `it.fails` in `CModal.spec.ts`): `finalizeClose` sets `internalClose` around `dialog.close()`, but the native `close` event is fired in a later task, so `onNativeClose` cannot tell the library's own close apart and re-dispatches `false`. Hidden until now by the 300 ms close animation; the harness runs with `prefers-reduced-motion: reduce`.
- **c-menu drops focus to `<body>` on Escape with a slotted `c-button` trigger** (`KNOWN_FOCUS_LOSS_ON_CLOSE`): the return call is `trigger.focus()` on a `display: contents` host. c-button needs a `focus()` that delegates to its inner button, or the menu must focus the inner control.

Harness facts learned: Vitest tiles test files in one page, so the pointer from one file's click can hover an element in another — `fileParallelism: false` and `parkPointer()` before captures; Chromium's "ResizeObserver loop completed with undelivered notifications" (c-login-card) is a benign notice filtered by `BENIGN_BROWSER_NOTICES`; c-tree-select's combobox is clipped by design, so field panels are opened by clicking the `c-input` box.
