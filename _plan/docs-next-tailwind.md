# Tailwind migration for csc-ui-documentation-next

> On approval, save a copy of this plan to `_plan/docs-next-tailwind.md` (plans live in the repo's `_plan/` folder).

## Context

`_plan/documentation-changes.md` lists "use tailwind" as an architecture todo for the new docs site. Today `packages/csc-ui-documentation-next` (Nuxt 4) is styled by ~523 lines of hand-written CSS in `app/assets/site.css` plus ~40 lines of scoped styles in 5 SFCs, while the library it documents (`csc-ui-next`) is authored entirely in Tailwind v4 + tailwind-variants against a semantic-token layer (ADR-0004/0006/0007/0010). Migrating the docs chrome to Tailwind aligns the two codebases, removes the parallel quasi-BEM class system, and produces the first real consumer of a library-exported Tailwind theme — which the planned Customization docs page will document for external consumers.

## Decisions (grilling session, all confirmed by Oskari)

1. **Scope: site chrome only.** Migrate `site.css` and docs components. Example files' scoped styles (`app/examples/**`) stay plain CSS — their source is consumer-facing copy-paste code and consumers aren't assumed to use Tailwind.
2. **The library exports the Tailwind theme.** New consumer-facing export `@cscfi/csc-ui-next/css/tailwind-theme.css` containing the semantic-token `@theme` mapping. Single source of truth; docs imports it.
3. **Export is semantic-only.** Only mode-aware roles (`bg-surface`, `text-on-surface`, `border-border`, `bg-primary`, …). Palette ramps (`bg-primary-600`) stay internal per ADR-0010's rationale; consumers needing a raw step write `var(--c-primary-600)` explicitly.
4. **Docs app disables Tailwind's default color palette** (`--color-*: initial`), so semantic tokens are the only color utilities — hardcoded `text-white`/`bg-gray-100` fail to compile. Structural enforcement; no CI guard needed. Arbitrary values (`bg-[#0f172a]`) remain allowed for the intentionally fixed-dark code-panel fallbacks.
5. **Preflight + custom prose layer.** Adopt Tailwind preflight, drop the hand reset. Rendered-markdown regions (`.usage` from usage.md, API descriptions) get a small custom `@layer`-scoped prose treatment in the residual stylesheet — no typography plugin.
6. **1:1 visual parity.** Pure refactor, verified by before/after screenshots in light and dark. Code blocks keep current behavior; docs chrome stays plain HTML (csc-ui-component adoption and other todo items are separate later work). Dead rules in site.css (the early fixed-dark `.example-tabs`/`.example-tab` block at lines 257–292, overridden at 483–506) are dropped, since parity is about rendered output.
7. **ADR-0018** documents the consumer-facing Tailwind theme export and why it is semantic-only.
8. No `tailwind-variants` in the docs app — plain utilities suffice; docs components aren't variant matrices.

## Implementation

### 1. Library: extract the semantic theme export (`packages/csc-ui-next`)

- Create `src/styles/css/tailwind-theme.css` containing the semantic-token `@theme inline` block currently at `src/tailwind.css:158-250` (surface ladder, on-* roles, border/ring, brand+status roles with hover/subtle variants, nav, logo, inverse, scrim). `inline` works for both shadow-root (library) and light-DOM (consumer) builds since utilities compile to `var(--c-*)` references that resolve from `:root`.
- In `src/tailwind.css`, replace that block with `@import './styles/css/tailwind-theme.css';` — single source of truth. The palette-step block (lines 26–137), `--ease-standard`, and `rounded-csc-*` utilities stay internal.
- No packaging work needed: `scripts/copy-styles.js` already copies `src/styles/css/*` → `dist/styles/css/*`, and the `"./css/*"` export in `package.json` exposes it as `@cscfi/csc-ui-next/css/tailwind-theme.css`.
- Header comment in the new file: this is public consumer API (ADR-0018); requires the consumer's own Tailwind v4 build + `tokens.css` import.

### 2. ADR + glossary

- Write `docs/adr/0018-consumer-tailwind-theme-export.md`: context (docs-next as first Tailwind consumer; consumers previously had only raw `--c-*` vars), decision (export semantic-only `@theme`), alternatives rejected (docs-local copy → drift; exporting palette ramps → invites mode-unaware UI, doubles stable API surface, contradicts ADR-0010's rationale), consequences (theme file is load-bearing public API; role additions in tokens must propagate to it — same KEEP IN SYNC note as the internal map).
- Add a `CONTEXT.md` glossary entry under "Theming & dark mode": **Tailwind theme export** — the consumer-facing `@theme` mapping of semantic tokens to Tailwind utility names; semantic-only by design.

### 3. Docs app: wire Tailwind (`packages/csc-ui-documentation-next`)

- Add devDeps `tailwindcss` + `@tailwindcss/vite` (^4.3.1, matching the library). Note: install with `CI=1 pnpm install` (cross-branch pnpm TTY quirk).
- Register the Tailwind vite plugin in `nuxt.config.ts` `vite.plugins` (alongside `stubExampleDemosInSsr`).
- New `app/assets/tailwind.css`:
  ```css
  @import 'tailwindcss';
  @theme { --color-*: initial; }                       /* no default palette */
  @import '@cscfi/csc-ui-next/css/tailwind-theme.css'; /* semantic colors back in */
  @theme { --font-sans: 'museo-sans', system-ui, sans-serif; }
  ```
  (Docs-specific: font token lives here, not in the library export. Verify `--color-*: initial` ordering vs the re-added colors; adjust if Tailwind's cascade requires the reset inside the same `@theme` block.)
- `nuxt.config.ts` css array becomes `['@cscfi/csc-ui-next/css/tokens.css', '~/assets/tailwind.css', '~/assets/site.css']` (site.css shrinks to the residual sheet).

### 4. Migrate site chrome to utilities

Move `site.css` rules into `class=""` utilities in the templates that own them (classes like `.site-nav` are only consumed from these files):

- `app/app.vue` — `.site*`, header, nav. Nav-link active state via NuxtLink's `active-class`/`exact-active-class` props or `[&.router-link-active]:` variants.
- `app/pages/index.vue` — `.lead`, `.component-grid`, `.component-card`.
- `app/pages/components/[tag].vue` + API/doc components — `.doc-section`, `.page-with-rail`, `.toc*`, `.component-api*`, tables (`.table-wrap`, th/td), `.api-section`.
- `app/components/ExampleBlock.vue` — `.example*` (use the *current winning* theme-aware tab styles at site.css:483–506; drop the dead fixed-dark block).
- `app/components/ThemeToggle.vue` — `.theme-toggle*`; `color-mix()` states as arbitrary values, e.g. `border-[color-mix(in_srgb,var(--c-on-nav)_40%,transparent)]` or a component-level CSS var.
- `app/components/ApiComponent.vue` — replace the scoped `.api-type-badge` block with utilities.
- Repeated combos (e.g. shared code-panel styling) may use a docs-local `@utility` in `tailwind.css` rather than duplicating long class strings — sparingly.

### 5. Residual `site.css` (what utilities can't express — mirrors ADR-0007's spirit)

Keep only:
- Prose layer for rendered markdown: `.usage` headings/paragraphs/lists/inline `code`/`pre` (uncontrolled HTML from usage.md), plus global `code` element style if still wanted outside utilities.
- Shiki dual-theme swap: `:root[data-theme='dark'] .shiki …` + the `prefers-color-scheme` fallback (descendant selectors over Shiki-generated spans with `!important`; not expressible as utilities).
- Flash-of-un-upgraded-content guards: `c-modal:not(:defined), c-toasts:not(:defined) { display: none; }`.
- Delete the hand reset (preflight covers it) and everything migrated. Expected size: ~60–80 lines with a header comment stating the residual policy.

## Files touched

- `packages/csc-ui-next/src/styles/css/tailwind-theme.css` (new), `src/tailwind.css`
- `docs/adr/0018-consumer-tailwind-theme-export.md` (new), `CONTEXT.md`
- `packages/csc-ui-documentation-next`: `package.json`, `nuxt.config.ts`, `app/assets/tailwind.css` (new), `app/assets/site.css`, `app/app.vue`, `app/pages/index.vue`, `app/pages/components/[tag].vue`, `app/components/{ExampleBlock,ThemeToggle,ApiComponent}.vue` and sibling API/TOC components
- `_plan/documentation-changes.md`: tick "use tailwind"

## Verification (1:1 parity)

1. **Before** starting step 4: build the library (`pnpm --filter @cscfi/csc-ui-next build`), run `pnpm dev:docs-next`, screenshot key pages (index, one component page e.g. `/components/c-button` with examples + API + TOC, mobile width) in **light and dark** via the headless-chromium recipe (memory: csc-ui-next visual verify).
2. **After**: same screenshots; diff visually. Chrome must match; only dead-rule cleanup may differ (verify the example-tab bar already renders theme-aware today — the fixed-dark block is overridden).
3. Grep the docs build output for orphaned class names (`site-`, `component-card`, `toc-`) to confirm nothing still references deleted CSS.
4. Confirm the semantic-only guarantee: `bg-red-500`-style classes produce no CSS in the docs build (compile check), while `bg-surface` etc. do.
5. `pnpm --filter @cscfi/csc-ui-documentation-next build` (SSG prerender must pass), plus vue-tsc/eslint for both packages. Don't run vue-tsc while the dev server runs (OOM, per memory).
6. Library regression: `pnpm --filter @cscfi/csc-ui-next build` + a component screenshot to confirm the extracted `@import` in `src/tailwind.css` produces identical shadow-root sheets.
