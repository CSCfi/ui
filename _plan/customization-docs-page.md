# Customization page for csc-ui-documentation-next

## Context

The library has four consumer customization surfaces, each decided by ADR but only documented as sections buried inside the getting-started and migration guides: runtime seed→ramp theming (`applyTheme`/`themeToCss`/`resetTheme`, ADR-0011), dark mode via `data-theme` + the semantic-token layer (ADR-0010), `::part()` restyling (ADR-0006), and the Tailwind theme export (ADR-0018). ADR-0011 and ADR-0018 both reference a *planned Customization docs page* that doesn't exist yet. This adds that page at `/customization`, makes it the single source of truth, and trims the duplicated guide sections to teasers that link to it.

Decisions grilled and settled with Oskari: one page covering all four surfaces; trim both existing guides; live interactive seed playground (deliberately re-themes the whole site — honest to how `applyTheme` works); add theming re-exports to `@cscfi/csc-ui-next-react`; flavor-specific blocks only where frameworks genuinely diverge; curated hand-written semantic-token table; bespoke page (no guide-engine generalization).

Terminology: use CONTEXT.md canon — *seed*, *family*, *semantic token*, *part*, *theme mode*, *Tailwind theme export* (**never "preset"**). No new glossary terms; no ADR needed (the page is what existing ADRs already promise).

## Changes

### 0. Library: React re-export (do first)

`packages/csc-ui-next-react/src/index.ts` — append:

```ts
export { applyTheme, resetTheme, themeToCss } from '@cscfi/csc-ui-next';
export type { Family, ThemeSeeds } from '@cscfi/csc-ui-next';
```

`@cscfi/csc-ui-next` is already a peer+dev dep; no config change. Rebuild: `pnpm --filter @cscfi/csc-ui-next-react build`. **No changeset** — repo has no changesets infra (release-please/conventional commits); commit as `Feat(csc-ui-next-react): re-export runtime theming API from package root`. Docs package is private. The docs site never imports the react package (the import line is highlighted text only), so docs work isn't blocked on this.

### 1. Content: `app/content/customization.ts` (new)

Copy the `migration.ts` shape (section interface + file-local `forAll` helper — per-file duplication is the precedent), plus a new optional `link?: { label: string; to: string }` field. Also export token-table data: `TOKEN_GROUPS` (heading, note?, rows of `{ token, light, dark, purpose }`), `ROLE_FAMILIES` (8 families), `ROLE_SEXTET` (6 pattern rows).

Sections (ids become anchor targets):

| id | title | flavor treatment |
|----|-------|------------------|
| `overview` | Two axes of customization | prose only — colors flow seed → ramp → semantic tokens → both modes; structure via named parts; per-component `--c-button-*` vars don't exist |
| `brand-theming` | Re-brand with theme seeds | per-flavor **import line only** (react ← `@cscfi/csc-ui-next-react`, others ← `@cscfi/csc-ui-next`); one shared ts block: `applyTheme` merge semantics, `resetTheme(['accent'])`/`resetTheme()`, fail-loud validation, 8 chromatic families only (neutrals excluded per ADR-0011) |
| `ssr-fouc` | Server rendering & first paint | fully per-flavor: Nuxt `useHead` style / Next.js `app/layout.tsx` `<style>{themeToCss(...)}</style>` / Angular `main.ts` / vanilla static `<style>`. If the react package's element-registration side effect misbehaves server-side during verification, fall back to core-package import in that one snippet and flag it |
| `dark-mode` | Dark mode | `forAll`: OS preference default, explicit `data-theme` wins, seeds and mode compose; blocks: `<html data-theme="dark">` + setAttribute toggle w/ pre-paint localStorage script (docs site's own pattern) |
| `tokens` | Semantic token reference | prose intro (`--c-` prefix in CSS vs unprefixed Tailwind utilities); table rendered in template |
| `parts` | Restyle with ::part() | `forAll`: parts are the customization contract (ADR-0006); per-component part list lives on each component page; CSS block example; colors inside part rules still flow through tokens |
| `tailwind` | Tailwind theme export | `forAll`: "a Tailwind v4 `@theme` mapping" — semantic roles only, must be paired with `tokens.css`; `@import` pair block + utility usage snippet; mention `--color-*: initial` reset |

Token table content (source of truth `packages/csc-ui-next/src/styles/css/tokens.css`): surface ladder (5), `on-*` foregrounds (4), border/ring (3), role sextet as a **pattern table** (don't hand-write 48 light/dark values — the mapping isn't uniform, e.g. dark `primary`→`-400` vs others `-300`; live swatches show actuals), inverse family (4) + scrim (mode-invariant). Note that `nav-*`/`logo-*` are library-chrome roles, intentionally outside the curated set.

### 2. `app/components/ThemePlayground.vue` (new)

- Color `<input>` per family + `<c-button>` "Reset to defaults", styled with semantic-token utilities in a bordered figure captioned "re-seeds this whole site live".
- `FAMILIES` list hard-coded with a keep-in-sync comment (`DEFAULT_SEEDS` isn't exported from the package root); initial values read via `getComputedStyle(document.documentElement).getPropertyValue('--c-${family}-500').trim().slice(0, 7)` (tokens are 8-digit hex; color inputs need `#rrggbb`) in `onMounted` — self-syncing after reset.
- `@input` → `seeds[family] = value; applyTheme({ [family]: value })` (merges); reset → `resetTheme(); readSeeds()`.
- Header ColorSwitcher writes the same root vars — last write wins, reset clears both; no UI-state sync (stale switcher label accepted). Used inside `<client-only>` (ExampleBlock precedent; needs DOM anyway).

### 3. Page: `app/pages/customization.vue` (new)

Copy the `getting-started.vue` skeleton verbatim (lead `<p>`, `<flavor-switcher class="md:hidden" />`, section `v-for` with intro + code figures, `useAsyncData('customization', …)` prerender-highlighting over all flavors — key is unique, `useHead({ title: 'Customization — CSC Design System' })`). Bespoke insertions keyed by section id, inside the `v-for` — do **not** generalize a section engine:

- `section.id === 'brand-theming'` → `<client-only><theme-playground /></client-only>` after the figures.
- `section.id === 'tokens'` → hand-written tables per `TOKEN_GROUPS` (duplicate the file-local `TH`/`TD` class consts from `ApiComponent.vue`): columns Token / live swatch (`:style="{ background: \`var(--c-${row.token})\` }"` — tracks mode AND playground) / Light / Dark / Purpose; plus 8×6 live swatch matrix for the role sextets.
- Render optional `section.link` (markup below).

### 4. Nav: `app/app.vue`

New `<c-side-navigation-item>` under "Guides" between Getting started and Migration guide, following the existing `:active.prop="route.path === '/customization'"` + `@item-change="navigateTo('/customization')"` pattern (~line 48).

### 5. Trim existing guides + link support

Add `link?: { label; to }` to `GettingStartedSection`/`MigrationSection`; render in both `getting-started.vue` and `migration.vue` after the figure loop as a `<nuxt-link>` paragraph (intros are plain text and can't carry links).

- `getting-started.ts` `theming`: trim intro to two sentences (OS default + `data-theme` pin; one-seed re-brand), keep the single `forAll` applyTheme block, drop the tailwind sentence; link → `/customization`.
- `migration.ts` `styling`: keep before/after blocks, trim intro to "per-component custom properties are gone; `::part()` is the sole customization API"; link → `/customization#parts`.
- `migration.ts` `theming`: keep before/after blocks and old→new framing, drop tailwind/mechanics detail; link → `/customization`.

## Verification

1. `pnpm --filter @cscfi/csc-ui-next-react build` + typecheck; `dist/index.d.ts` exposes the 5 new exports.
2. `pnpm dev:docs-next`; on `/customization`: all 7 sections render; flavor switch changes only §brand-theming import line + §ssr-fouc recipes; light/dark flips prose, Shiki dual theme, and live swatches; playground re-themes whole site per family; reset restores defaults and snaps inputs back; ColorSwitcher interplay (set a header color, playground reset clears it).
3. Nav item highlights on `/customization`; trimmed guide sections show working links including the `#parts` anchor.
4. Stop dev server first, then `pnpm --filter @cscfi/csc-ui-documentation-next typecheck` (vue-tsc OOMs alongside dev server — never concurrent).
5. `pnpm --filter @cscfi/csc-ui-documentation-next lint` (`lint:examples` unaffected — only scans `app/examples/`).
6. `pnpm --filter @cscfi/csc-ui-documentation-next generate` — `/customization` in prerendered routes with highlighted payload.

## Files

New: `app/pages/customization.vue`, `app/content/customization.ts`, `app/components/ThemePlayground.vue` (all under `packages/csc-ui-documentation-next/`).
Modified: `packages/csc-ui-next-react/src/index.ts`; docs `app/app.vue`, `app/content/getting-started.ts`, `app/content/migration.ts`, `app/pages/getting-started.vue`, `app/pages/migration.vue`.

On approval, copy this plan into the repo's `_plan/` folder per standing preference before starting implementation.
