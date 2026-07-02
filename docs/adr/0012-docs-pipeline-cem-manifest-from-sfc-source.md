---
status: accepted
---

# Component docs are generated from SFC source into a Custom Elements Manifest; the docs site consumes only that artifact

`csc-ui-next` gains a build-time analyzer (in `scripts/`, built on `vue/compiler-sfc` + the TypeScript compiler API) that emits `dist/custom-elements.json` (CEM schema, advertised via the `customElements` package field) plus colocated per-component `usage.md` files copied to `dist/docs/`. A new docs site, `csc-ui-documentation-next` (Nuxt 4, statically generated, client-rendered custom elements), is driven entirely by these artifacts through the workspace dependency. It documents `csc-ui-next` only — no Stencil `docs.json`, no `CSC_UI_IMPL` toggle. The old docs site stays untouched until the Stencil package retires.

## Where each piece of API metadata comes from

- **Props/attributes**: the existing `defineProps<Interface>()` + `withDefaults` declarations, with JSDoc on interface members. Attribute names (kebab-case, boolean `''` semantics) are derived and documented alongside props.
- **Events**: a new convention, since no component uses `defineEmits` — all events are host-dispatched `CustomEvent`s. Each component declares a JSDoc-annotated **event map** interface (event name → `detail` type) consumed by a typed emit helper (`useHostEmit<CButtonEvents>()`); the helper is the only dispatch path, so the map is simultaneously the runtime contract, the consumer typing, and the manifest's event section. The ~18 components dispatching ad hoc (including via `emitModelValue`, whose `changeValue`/`update:value`/`input` triple must appear in each user's map) are refactored onto it. Components with the v-model contract are flagged in the manifest via a vendor-extension field.
- **Slots, CSS parts, CSS custom properties**: JSDoc tags (`@slot`, `@csspart`, `@cssprop`) in a component-level docblock. The analyzer auto-discovers actual slot/part names from the template (including `exportparts` forwards under the `<child>-<part>` convention of ADR-0006) and enforces a 1:1 match with the tags — a mismatch fails the build. Because parts are the sole customization API (ADR-0006), this lint doubles as an API-change tripwire. `@cssprop` is checked best-effort only (usages hide inside Tailwind arbitrary-value strings) and warns instead of failing.
- **Methods**: `defineExpose()` entries with JSDoc.
- **Shared public types** (`src/types.ts`): extracted with JSDoc into a manifest vendor-extension field (CEM has no first-class type-alias kind); the docs site renders them as a Types page cross-linked from prop/event type text.
- **Usage prose**: a hand-written `usage.md` beside each SFC — free-form markdown under conventional headings; a missing file is a build warning.

## Seeding from the Stencil docs

A one-time script copies matching descriptions from the old `csc-ui/docs.json` (matched by tag + member name) into the new docblocks and `usage.md` skeletons, marking every seeded item with a review marker the analyzer counts and reports per component. Diverged APIs get nothing seeded and are written fresh. Nothing seeded ships silently as reviewed prose.

## Examples

Live examples belong to the docs package (they are site UI, not library API), authored once per scenario as Vue SFCs and rendered live. The ts/react/angular/vanilla code tabs are produced by a snippet transformer at docs build time (same custom-element tags make the rewrite largely mechanical), with optional hand-written per-framework override files when the transform falls short.

## Considered alternatives

- **`vue-docgen-api`** — parses SFC props/slots well, but cannot see host-dispatched events (it needs `defineEmits`), knows nothing of CSS parts/custom properties, and outputs its own schema with no web-components ecosystem behind it. Rejected.
- **Bespoke `docs.json`** (Stencil-style, ours) — fits the docs site exactly but forfeits the CEM ecosystem (VS Code custom-data and JetBrains web-types generators, api-viewer tooling) and leaves us owning a spec forever. Rejected.
- **`@fires`/JSDoc-only event annotations** — zero refactoring, but doc-only: no type safety and silent drift from actual dispatches. Rejected in favor of the typed event map.
- **Static analysis of `dispatchEvent` calls** — fully automatic but fragile (event names pass through wrapper functions), cannot infer `detail` types reliably, and gives descriptions nowhere to live. Rejected.
- **Examples colocated in the library** — one folder per component for everything, but the library build would compile docs-site UI code and library CI would run on every example tweak. Rejected.
- **Hand-written examples per framework** — best per-framework fidelity, but 4× authoring across ~72 components with drift risk. Rejected as the default; retained as the per-example override escape hatch.
- **VitePress / plain Vite SPA for the site** — VitePress's head start erodes once the fully custom design-system branding demands a custom theme; a plain SPA forfeits SSG for public docs. Nuxt 4 keeps full design freedom with the team's existing Nuxt + custom-element experience.
