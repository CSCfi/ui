# Docs-next: flavored examples, persisted flavor selection, getting-started page

> On implementation start, copy this plan into the repo at `_plan/docs-flavors.md`
> (user convention: plans live in `_plan/`).

## Context

The docs-next site (`packages/csc-ui-documentation-next`) shows every example as a
Vue SFC only. `_plan/documentation-changes.md` items 1, 2 and 6 call for:
a documentation-wide **flavor** selection (Vue | React | Angular | TypeScript),
every example available in all four flavors defaulting to that selection, and a
getting-started page whose code blocks follow it. csc-ui-next is Vue-authored
custom elements with **no** React/Angular wrapper (the published
`@cscfi/csc-ui-react` wraps the old Stencil library only).

## Decisions (grilling session, 2026-07-08)

1. **Fourth flavor = vanilla TypeScript custom elements** — plain `c-*` elements
   driven imperatively from a typed TS module. The old `vanilla`/"JavaScript"
   label is retired in favor of `typescript`/"TypeScript".
2. **Variants are checked-in, agent-generated files** (no source-to-source
   transformer). Vue stays the canon (ADR-0012); drift is caught by a CI check.
3. **React gets a real wrapper package; Angular stays native** (standalone
   components + `CUSTOM_ELEMENTS_SCHEMA`).
4. **React wrapper = codegen from the Manifest onto `@lit/react`**
   (`createComponent` per component, typed props/events from the event map).
5. **Package name: `@cscfi/csc-ui-next-react`** (`packages/csc-ui-next-react`);
   may be renamed to `csc-ui-react` at the major when Stencil is retired.
6. **Tab click = global switch**: clicking any example tab updates the single
   site-wide flavor; every block, the getting-started blocks, and the persisted
   preference follow.
7. **Getting started = one page** (`/getting-started`) with flavor-aware code
   blocks, not a route per flavor.
8. **A header flavor switcher** also exists (next to ThemeToggle), showing and
   setting the current flavor on pages without examples.
9. **TypeScript examples = single `.typescript.ts` file**, imperative typed DOM
   (`document.createElement('c-switch')` etc.).
10. **Canonical term: “flavor”** — `useFlavor()`, `csc-docs-flavor`,
    `<name>.<flavor>.<ext>`.

Fallback (decided, not asked): if an example lacks the selected flavor’s file,
that block shows the Vue canon tab; the global selection is left untouched. The
`html` label in `FRAMEWORK_LABELS` is dropped (zero `.html` overrides exist).
Live demos always render the Vue canon SFC regardless of flavor.

## Deliverables

### A. csc-ui-next: typed tag-name map (small)

Generate a `declare global { interface HTMLElementTagNameMap … }` `.d.ts`
mapping every `c-*` tag to its element class, published from the package root
types. Feeds the TypeScript-flavor examples and the React codegen. Hook it into
the existing analyzer/IDE-artifact pipeline (ADR-0015,
`packages/csc-ui-next/scripts/analyzer`).

### B. New package `packages/csc-ui-next-react` → `@cscfi/csc-ui-next-react`

- Codegen script reads `packages/csc-ui-next/dist/custom-elements.json` (the
  Manifest) and emits one `createComponent({ react, tagName, elementClass,
  events })` per standalone component + composed child; events come from the
  component’s event map, props typed from the element class.
- Runtime dep `@lit/react`; peer deps `react` (>=18) and `@cscfi/csc-ui-next`.
- Importing the package registers the elements (side-effect import of
  `defineCustomElements()` — same contract the existing
  `c-switch/basic.react.tsx` demonstrates).
- Wire into workspace build; release via the existing release tooling.
- **ADR-0019**: React wrapper generated from the Manifest onto `@lit/react`
  (alternatives: hand-written wrappers, React-19-only guidance).

### C. Docs: flavor mechanism

- `app/composables/useFlavor.ts` — clone the `useTheme.ts` pattern:
  `type Flavor = 'vue' | 'react' | 'angular' | 'typescript'`, module-scoped
  singleton ref, default `'vue'`, persisted to localStorage `csc-docs-flavor`,
  `initFlavorFromStorage()` called from a client plugin (extend
  `plugins/theme.client.ts` or add `flavor.client.ts`). SSR/first paint renders
  the Vue default and syncs post-hydration — brief tab flash accepted (unlike
  theme, no pre-paint script needed).
- `app/composables/useExamples.ts` — replace `FRAMEWORK_LABELS` with the four
  canonical flavors, key tabs by flavor id (not display label), fixed tab order
  Vue → React → Angular → TypeScript.
- `app/components/ExampleBlock.vue` — active tab derives from `useFlavor()`
  (fallback to Vue when the variant is missing); clicking a tab calls the
  global setter. Remove the local-only `activeLabel` state.
- `app/components/FlavorSwitcher.vue` — compact segmented control/select in the
  header (`app.vue`), `<ClientOnly>` like ThemeToggle.
- **ADR-0020**: docs flavor system — global persisted selection + checked-in
  agent-generated variants with CI parity guard (alternatives: per-block tabs,
  build-time transformer).

### D. Getting-started page

- `app/pages/getting-started.vue`, linked from the site nav/landing page.
- Content per flavor (blocks switch with `useFlavor()`): install
  (`@cscfi/csc-ui-next`, plus `@cscfi/csc-ui-next-react` for React), element
  registration, framework config (Vue `isCustomElement`, Angular
  `CUSTOM_ELEMENTS_SCHEMA`, nothing for TS), `css/tokens.css` import, a first
  component snippet, pointer to theming (`applyTheme`, ADR-0011).
- Highlight all flavors’ blocks at prerender with the existing
  `app/utils/highlight.ts` `highlightCode`, same `useAsyncData` pattern as
  `app/pages/components/[tag].vue`.

### E. Bulk variant generation + parity guard

- For every canon `app/examples/<tag>/<name>.vue` (~150–200 files), generate
  three siblings: `<name>.react.tsx` (uses `@cscfi/csc-ui-next-react`; rewrite
  the existing raw-element `c-switch/basic.react.tsx`), `<name>.angular.ts`
  (standalone component, inline template, `CUSTOM_ELEMENTS_SCHEMA`),
  `<name>.typescript.ts` (imperative typed DOM). Keep the `// @ts-nocheck`
  header convention (deps not installed in the docs package).
- Generated in reviewable waves by agents (Workflow fan-out at implementation
  time), committed as plain files.
- Parity check script (`packages/csc-ui-documentation-next/scripts/` or repo
  `scripts/`): every canon Vue file must have all three variants; fails CI with
  the missing list. Run in the docs build/CI alongside the existing checks.

### F. Documentation-of-the-documentation

- `CONTEXT.md` (Documentation section): add **Flavor** (the reader’s chosen
  consumption dialect: Vue | React | Angular | TypeScript; _avoid_ framework,
  consumer, language) and **Example variant** (a checked-in per-flavor sibling
  of a canon example; Vue is the canon per ADR-0012).
- Tick items 1, 2, 6 in `_plan/documentation-changes.md` when done.

## Suggested order

A → B (wrapper needs the manifest + tag map) → C (mechanism, can parallel B)
→ D (needs wrapper name for React install text) → E last (needs B published
locally so React snippets are honest).

## Verification

1. `pnpm build` in `csc-ui-next`, then build `csc-ui-next-react`; typecheck a
   scratch React file importing a generated component (typed props/events).
2. `pnpm dev` docs (mind the pnpm TTY/memory quirks: `CI=1 pnpm install`; don’t
   run vue-tsc while the dev server runs): switch flavor via an example tab →
   all blocks + header switcher follow; reload → selection persists
   (localStorage `csc-docs-flavor`); getting-started blocks follow the flavor.
3. Run the parity check with one variant deleted → CI fails with the file listed.
4. `pnpm generate` (SSG) → prerendered pages hydrate without errors; Shiki
   highlighting present for all four tabs.
5. Visual pass with the headless-chromium screenshot recipe (light + dark).
