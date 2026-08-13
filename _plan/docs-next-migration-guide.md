# Plan: Consumer upgrade guide — `@cscfi/csc-ui` → `@cscfi/csc-ui-next`

## Context

`@cscfi/csc-ui-next` (Vue-SFC-compiled custom elements) has reached feature parity
with the old Stencil `@cscfi/csc-ui` — 72 of 73 tags are migrated; only
`c-swiper`/`c-swiper-tab` remain and are slated for deletion. Tag names are stable
across both libraries, but the surrounding contract is not: registration, two-way
binding, event names, customization, theming, and the React wrapper package all
changed. There is currently **no consumer-facing documentation** anywhere in the
repo describing how to move an existing app from the old package to the new one.

This change adds that guide to the new docs site (`csc-ui-documentation-next`) so
external consumers have a single, flavor-aware reference for the upgrade.

### Terminology decision (grilled)

- **"Migration"/"migrated component"** stays reserved for the *maintainers'* internal
  Stencil→Vue port (as in CONTEXT.md today). Unchanged.
- The *consumer's* act of moving their app's dependency is an **"upgrade"**. Body copy
  says "upgrade"; the page may still be colloquially titled "Migration guide" since
  that's what consumers search for.
- Record this split in `CONTEXT.md` (see below).

### Decisions locked during grilling

| Decision | Choice |
|---|---|
| Home & form | New `/migration` Vue SFC page in `csc-ui-documentation-next`, cloned from the getting-started pattern (page + `app/content/*.ts` data module). No standalone markdown file. |
| Audience | All four flavors — vue / react / angular / typescript — following the site-wide flavor switcher. |
| Structure | Cross-cutting topic sections **+** a component-specific "spotlight" section for the few real API breaks. Not an exhaustive 72-row matrix. |
| Migration path | All-at-once package swap, with an explicit collision warning (you cannot register both libraries in one app — same tag names → `customElements.define` collision). No supported per-component coexistence for consumers. |
| README fix | In scope — correct the `theme.css` → `tokens.css` import mismatch. |

## Files to create / modify

**Create (docs site):**
- `packages/csc-ui-documentation-next/app/content/migration.ts` — the guide content
  as a typed sections array, mirroring `app/content/getting-started.ts`
  (`{ id, title, intro, blocks }`, per-flavor `intro: Partial<Record<Flavor|'all', string>>`
  and per-flavor `blocks`). This is where all prose + code lives.
- `packages/csc-ui-documentation-next/app/pages/migration.vue` — clone of
  `app/pages/getting-started.vue`; iterates the sections, precomputes Shiki HTML for
  every flavor in `useAsyncData`, swaps client-side on flavor change. Static
  highlighted code only (no live `ExampleBlock` demos — side-by-side old/new snippets
  are sufficient).

**Modify:**
- `packages/csc-ui-documentation-next/app/app.vue` — add a
  `<c-side-navigation-item>` under the existing **Guides** title pointing at
  `/migration` (same `:active.prop` + `@itemChange="navigateTo('/migration')"`
  pattern as the Getting-started item).
- `packages/csc-ui-next/README.md` (line 12) — fix
  `@cscfi/csc-ui-next/css/theme.css` → `@cscfi/csc-ui-next/css/tokens.css`.
  (Verified: package `exports` maps `./css/*` → `dist/styles/css/*`, which contains
  only `tokens.css` and `tailwind-theme.css`.)
- `CONTEXT.md` — add a short note under the existing "migrated component" language (or
  Flagged ambiguities) recording the migration(port) vs upgrade(consumer) split.

## Guide content outline

Each section is per-flavor where the break is framework-specific, and shared (`all`)
where it isn't.

1. **Before you start** — tags are stable (`<c-button>` etc. unchanged); this is an
   all-at-once package swap; **you cannot run both libraries at once** (tag-name
   collision on `customElements.define`); ESM-only, so a bundler is assumed.
2. **Install & registration** — swap the dependency; drop `applyPolyfills` and the
   `/loader` subpath; new eager `import { defineCustomElements } from '@cscfi/csc-ui-next'`
   registers everything at once. CSS: replace `@cscfi/csc-ui/css/theme.css` with
   `@cscfi/csc-ui-next/css/tokens.css` (+ `tailwind-theme.css` for Tailwind consumers).
   - *Vue/Angular/TS*: register via `defineCustomElements()`.
   - *React*: switch package `@cscfi/csc-ui-react` → `@cscfi/csc-ui-next-react`
     (importing it registers elements as a side effect; ADR-0019).
3. **Two-way binding & events** — the headline break.
   - *Vue*: remove the `v-control` directive and the `@cscfi/csc-ui-vue`(2) dependency;
     plain `v-model` now works natively. **Do not teach `v-model:value`** — v-model
     args don't compile on custom elements (ADR-0017). For non-value state use
     `:prop` + `@change:prop` (lowercase kebab), e.g. `@change:open`, `@change:sort`.
   - *React/Angular/TS*: `changeValue` still fires (grandfathered), but prefer the
     native `input` event / typed `on*` props (React wrapper). Note `update:*` →
     `change:*` rename (only `update:value` survives, for v-model).
4. **Styling & customization** — `::part()` is now the **sole** customization API
   (ADR-0006). All per-component `--c-<component>-*` override variables are removed
   (e.g. `--c-button-background-color` → style `::part(root)` / theme tokens).
5. **Theming & dark mode** — semantic tokens replace the flat light-only ramp; new
   `data-theme="dark|light"` + `prefers-color-scheme` fallback; rebrand via runtime
   `applyTheme(seeds)` / `themeToCss(seeds)` (one step-500 seed per chromatic family,
   ADR-0011). `tailwind-theme.css` export for Tailwind consumers (ADR-0018).
6. **Component-specific changes** (spotlight — not exhaustive):
   - **`c-data-table`** (largest break, ADR-0016): `headers`→`columns`; `CDataTableHeader`
     → `CDataTableColumn`; per-cell data shape → plain domain objects + render
     functions (`cell?: (ctx) => VNode`, use the re-exported `h`); `pinned`/`hidden`
     booleans → tri-state expansion policy (`auto`/`never`/`always`). Column defs with
     functions must be bound as DOM **properties**, not attributes.
   - **`c-autocomplete`** (ADR-0009): no longer built on `c-dropdown`; own popover panel.
   - **`c-modal`** (ADR-0014): no native top layer/`::backdrop`; `scrim` token +
     `dismissable` prop vocabulary.
   - **`c-menu`**: declarative slotted `c-menu-item`/`c-menu-label` replaces the old
     programmatic `items`-array menu; leaf activation fires `select`.
   - **Removed**: `c-swiper`/`c-swiper-tab` have no upgrade target (slated for removal);
     `c-backdrop`/`c-ripple` were internal-only.
7. **Types & tooling** (brief) — public types now exported from the package root as
   `C<Component><Concept>`; IDE data via CEM `custom-elements.json` + `web-types.json`
   replaces `docs.json`/`vscode-data.json`.

## Reference material (for the author)

- Registration/events: `packages/csc-ui-next/src/index.ts`,
  `packages/csc-ui-next/src/shared/emitModelValue.ts`,
  `packages/csc-ui-vue/src/vControl.ts`, ADR-0003, ADR-0017.
- Styling/theming: ADR-0004, ADR-0006, ADR-0010, ADR-0011, ADR-0018,
  `packages/csc-ui-next/src/theme/applyTheme.ts`.
- React: ADR-0019. Data table: ADR-0016 + `CDataTable*` types in `src/index.ts`.
- Doc pattern to clone: `app/pages/getting-started.vue`, `app/content/getting-started.ts`,
  `app/utils/highlight.ts`, `app/composables/useFlavor.ts`, nav in `app/app.vue`.

## Verification

1. `cd packages/csc-ui-documentation-next && pnpm dev` (or `npm run dev`); open
   `/migration`. Confirm the page renders, the sidebar "Guides" entry appears and
   marks active, and switching the header flavor (vue/react/angular/typescript) swaps
   every code block. (Heed the memory note: run typecheck separately — vue-tsc OOMs
   alongside the dev server.)
2. Verify each snippet is copy-pasteable and correct — especially the `tokens.css`
   import path, plain `v-model` (no `v-model:value`), and the `c-data-table`
   `columns` example.
3. Build the site (`npm run build`) to confirm prerender/highlighting succeed and no
   route/nav breakage.
4. Confirm `packages/csc-ui-next/README.md` now imports `css/tokens.css`.

## Notes

- No ADR needed: this is documentation, easily reversible, not a hard-to-reverse
  architectural decision.
- Per user preference, this planning doc belongs in the repo's `_plan/` folder (e.g.
  `_plan/docs-next-migration-guide.md`) — copy it there during implementation, since
  plan mode restricts edits to this harness plan file for now.
- No changeset needed unless the README fix is deemed consumer-facing enough; the guide
  itself is docs-only.
