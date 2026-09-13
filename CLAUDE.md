# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CSC UI is a **web-component design-system library** implementing the CSC Design System: Vue 3 SFCs compiled to native custom elements (`defineCustomElement`), usable from any framework. Published as `@cscfi/csc-ui` (4.x). Versions 3.x and earlier were a Stencil implementation under the same npm name (ADR-0027).

**Repository**: https://github.com/CSCfi/ui

Read `CONTEXT.md` for the project's canonical vocabulary and `docs/adr/` for recorded decisions — both are load-bearing; follow the glossary's terms in code, docs, and commit messages.

### Architecture

A **pnpm workspaces monorepo** (ADR-0001, no Lerna):

- **`packages/csc-ui`**: The component library. Vue SFCs in `src/components/<c-tag>/`, one directory per custom element tag, each with a colocated `usage.md` (the only place component prose lives, ADR-0026). Builds with Vite + vue-tsc; design tokens via Style Dictionary; a custom analyzer generates the Custom Elements Manifest (`custom-elements.json`) and IDE data from SFC source (ADR-0012, ADR-0015).
- **`packages/csc-ui-react`**: React wrapper, **generated** from the manifest onto `@lit/react` (ADR-0019) by `scripts/generate.mjs`. Do not hand-edit generated components. Version-locked to the core package.
- **`packages/csc-ui-documentation`**: Nuxt docs site (private, not published). Auto-discovers components from the manifest; examples live in `app/examples/<c-tag>/` with per-flavor variants (`basic.react.tsx` etc., ADR-0020/0024).

## Commands

```bash
# From the root
pnpm build          # build all packages (topological)
pnpm dev            # watch csc-ui + docs dev server (http://localhost:3500)
pnpm test           # every Vitest project (Chromium + node); `pnpm build` first for the dist/example smokes
pnpm test:update    # rewrite visual baselines (run in the devcontainer, review the PNG diffs)
pnpm ui <script>    # run a script in packages/csc-ui

# In packages/csc-ui
pnpm build          # tokens -> chart data -> tag map -> vite build -> types -> strict manifest
pnpm docs:manifest  # regenerate custom-elements.json
pnpm lint           # tokens (strict) + a11y + ramp + chart guards
pnpm lint:tokens    # forbid direct palette-step utilities in SFCs
pnpm lint:a11y      # host attribute fallthrough check
pnpm lint:chart     # chart-data.ts matches the semantic maps (ADR-0040)
pnpm test           # browser + node projects; test:browser / test:node / test:watch
pnpm test:update    # rewrite the visual baselines of the browser project

# In packages/csc-ui-react
pnpm build          # regenerate wrappers from the manifest, then tsc

# In packages/csc-ui-documentation
pnpm test           # example smoke: mounts every canon against the built csc-ui
```

The React package build requires a built `packages/csc-ui` (it reads the manifest from it).

## Testing (ADR-0049)

Tests run against the **registered custom elements in headless Chromium** (Vitest 5 browser mode on Playwright); no jsdom/happy-dom for components. Follow the glossary's **Verification** terms.

- **Behaviour specs** are colocated: `src/components/<c-tag>/C<Name>.spec.ts`. Node-only specs use `*.node.spec.ts`. The shared harness is `packages/csc-ui/src/test/harness.ts` (`mount`, `settle`, `recordEvents`, `matchScreenshotInBothModes`); specs import SFC source, so no build is needed except for the dist smoke and the docs example smoke.
- **Every `Fix(` PR adds a behaviour spec that fails before the fix.** Every new component ships a colocated spec and a visual baseline per theme mode (`pnpm ui test:update`, commit the PNGs). Conformance suites enrol new tags automatically — fix the component, never opt out.
- A test fails on any `console.error` or `[Vue warn]`; consume an expected one with `consoleSpy.expect(/…/)`.
- Visual baselines are authored in the devcontainer and compared in CI within a small tolerance. Fonts are pinned to Liberation through `src/test/fonts.conf`; never raise the tolerance to make a token change pass.
- `playwright` is pinned in `pnpm-workspace.yaml`'s catalog to the Chromium baked into the devcontainer; bump both together.

## Releases (ADR-0028)

Releases are driven by **changesets**, not commit messages:

- Every PR to `main` must include a **new** changeset file (`pnpm changeset`); use `pnpm changeset --empty` for changes that must not release. CI blocks PRs without one. Editing an existing changeset does not count: once a "Version packages" PR has consumed it, it is inert (in pre mode it stays on disk, listed in `.changeset/pre.json`), so a follow-up fix always needs its own changeset.
- On merge to `main`, `.github/workflows/release.yml` maintains a "Version packages" PR; merging it builds and publishes `@cscfi/csc-ui` + `@cscfi/csc-ui-react` to npm (always the same version — a fixed group).
- Publishing uses npm trusted publishing (OIDC); there is no npm token secret.
- Never bump versions in `package.json` by hand.

## Conventions

- **Styling**: Tailwind v4 + `tailwind-variants` inside SFCs. Consumer customization is exclusively CSS `::part()` (ADR-0006); every colour goes through semantic tokens (`bg-surface`, `text-on-primary`) — direct palette-step utilities (`bg-primary-600`) fail CI (ADR-0010). Token values are emitted as `oklch()` from validated hex via one `cssColor()` in the ramp core (ADR-0041); never write a colour value by hand in generated CSS.
- **Events**: each component declares a JSDoc-annotated event-map interface — the single source of truth for emissions, typings, and the manifest. New event names are all-lowercase (ADR-0017); grandfathered camelCase events auto-dispatch a kebab-case twin (ADR-0021).
- **Types**: component-owned types live in the component and are exported from the entry; only types whose values cross component boundaries live in `src/types.ts` (ADR-0015).
- **Docs**: a component's description is the first paragraph of its `usage.md`; SFC docblocks carry tags only, no prose (ADR-0026).
- Commit style: `Feat(scope): ...` / `Fix(scope): ...` — capitalized types, no release semantics (versioning is changesets' job).
