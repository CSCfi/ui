---
status: accepted
---

# Dark mode via a mode-aware semantic-token layer, owned by csc-ui-next

`csc-ui-next` gains dark mode by introducing a **semantic-token layer** that components author against, rather than the raw palette steps they use today. Dark mode is then a single document-level block that re-points the semantic tokens to different palette steps; no per-component dark variants. The token pipeline that produces these tokens is **duplicated into `csc-ui-next`** so the package becomes self-sufficient ahead of the eventual removal of the Stencil `@cscfi/csc-ui`.

## Context

Today migrated components author against **palette-step utilities** — `bg-white` (37×), `text-primary-600` (36×), `text-white` (21×), `bg-primary-200` (14×), `bg-tertiary-100`, … — which resolve, via `@theme inline`, to `var(--c-white)`, `var(--c-primary-600)`, etc. The `--c-*` palette is a single flat light ramp declared on the document `:root` by the legacy Stencil package (`@cscfi/csc-ui`'s style-dictionary-generated `theme.css`) and inherited across shadow boundaries (ADR-0004). `csc-ui-next` ships **no tokens of its own** — consumers import the legacy package's `theme.css`.

This makes the naive dark-mode approach — redefine `--c-*` under a dark selector and let inheritance do the rest — unworkable: `bg-white` literally means white (can't be darkened without wrecking everything legitimately white), and a use like `text-primary-600` (brand text on a light surface) must diverge from `bg-primary-600` (a fill behind white text) in dark mode, which a single ramp value cannot express.

## Decisions

- **Semantic-token layer (not palette-swap, not per-component `dark:` variants).** A role-named layer (`--surface`, `--on-surface`, `--primary`, …) sits between components and the palette. Each role resolves to a *different palette step in light vs dark*. Components author semantic utilities (`bg-surface`, `text-on-surface`, `bg-primary`); a mode change re-themes the whole tree with zero per-component work. The palette ramp itself is **mode-independent** and untouched. Semantic CSS variables carry the `--c-` namespace prefix (`--c-surface`, `--c-on-primary`) like palette tokens, to avoid clobbering consumer custom properties; the Tailwind utility drops it (`bg-surface`), bridged by `@theme inline { --color-surface: var(--c-surface) }`.
- **Brand-preserving vocabulary + neutral additions.** Keep the existing CSC role names — `primary`, `secondary`, `accent`, `success`, `info`, `warning`, `error`, `link` — now mode-aware. **Add** neutral roles that don't exist today: the **surface ladder**, `on-*` foregrounds, `border`, `ring`. Rejected generic functional (shadcn/Radix) and full Material `on-X`/`-container` taxonomies — see alternatives.
- **Three-level surface ladder for elevation.** `surface` (page) / `surface-raised` (cards) / `surface-overlay` (popovers, menus, modals, toasts). Light: all near-white, depth from shadow. Dark: each step progressively lighter (e.g. `tertiary-900/800/700`) so elevation reads without shadows.
- **`on-` foregrounds flip for contrast.** e.g. `on-primary` is white on the light-mode `primary` fill but dark on the lighter dark-mode `primary` fill. This contrast-flip is precisely why a single mode-independent text colour is insufficient and the semantic layer is required.
- **Engineering owns the dark values; remap existing ramp steps.** No authoritative design spec yet. Dark roles map to existing palette steps (`--c-surface` dark = `var(--c-tertiary-900)`, `--c-primary` dark = `var(--c-primary-300)`, …); **no new hexes**. Reconcile with a design handoff later if one lands.
- **Activation: `data-theme` attribute + system fallback.** The consumer sets `data-theme="dark"`/`"light"` on the document root to force a mode; when unset, `prefers-color-scheme` decides. An explicit choice wins over the OS preference. Light is the default/unset state. Leaves a path to named themes beyond light/dark.
- **Duplicate the token pipeline into `csc-ui-next`.** Copy the style-dictionary config + palette `base.json` into `csc-ui-next` and expand it with the new semantic and dark token groups, emitting a **document-level** token stylesheet (palette + semantic definitions + the `data-theme`/media dark block). The two physical halves of the layer: (1) the `@theme inline` map (`--color-surface: var(--c-surface)`, …) lives in `tailwind.css` and is inlined into every shadow root; (2) the semantic value definitions + dark toggle live in the document-level stylesheet the consumer loads (inside shadow roots `:root` matches nothing) and inherit inward. This makes `csc-ui-next` self-sufficient now, so removing Stencil later is a clean delete with no token migration.
- **Semantic-only authoring, CI-enforced.** Direct palette-step colour utilities (`bg-primary-600`, `text-white`, `bg-tertiary-100`, …) are **forbidden** in component SFCs; a grep/lint guard fails the build on violation. Guarantees dark-mode completeness — a stray palette-step utility is a build failure, not a latent dark bug.
- **Scope: `csc-ui-next` only; mixed transition accepted.** Dark mode ships per migrated component. Non-migrated Stencil components stay light-only and frozen; a half-migrated app in dark mode is intentionally inconsistent until migration completes. No retrofit work on the package being deleted.
- **Pilot then batch.** `CButton` is converted to semantic tokens first as the locked reference (mirroring ADR-0004's rollout); the rest follow in reviewable batches.

## Considered alternatives

- **Swap `--c-*` palette values under a dark selector** — zero component changes, but `bg-white`/`text-white` and direct ramp references make it crude and break per-use control. Rejected.
- **Per-component `dark:` variants in each `tv` config** — explicit per-use control but duplicates dark intent across ~40 components and has no single switch point. Rejected.
- **Generic functional taxonomy (shadcn/Radix: `background`, `muted`, `destructive`, …)** — familiar, but discards CSC's established brand/status vocabulary (`info`, `link`, `warning`, `accent` have no clean analog). Rejected for continuity.
- **Full Material `on-X` / `-container` taxonomy** — highest contrast fidelity but ~40+ tokens and the heaviest migration. Rejected as over-engineered for the need.
- **Keep one token pipeline in `csc-ui` (legacy) and extend it** — single source during transition, but couples a `next`-only concept to the package being deleted and forces a move later. Rejected.
- **`next`'s generator reads `csc-ui`'s `base.json`** — avoids duplicating palette values but plants a build-time dependency on the doomed package. Rejected in favour of a clean copy (palette is brand-frozen during the transition, so sync cost is near-zero).

## Consequences

- **Re-authoring of all migrated components** from palette-step to semantic utilities. Mechanical but broad; gated by the CI guard.
- **New token pipeline + document-level token stylesheet in `csc-ui-next`** that consumers import; getting-started docs must point at it instead of (eventually, in addition to) `@cscfi/csc-ui/css/theme.css`.
- **Two palette JSONs to keep in sync** until Stencil is removed. Accepted: the palette is frozen during the transition.
- **Amends ADR-0004**: components no longer author against the full palette-step utility surface; the `@theme inline` map gains semantic entries and the palette-step utilities become discouraged (and CI-forbidden in SFCs). The `:host { display: contents }` rule, `tailwind-variants` authoring, parts, and `override` prop all stand.
- **Dark coherence is gated on migration completeness** by design (mixed light/dark pages during the transition).
