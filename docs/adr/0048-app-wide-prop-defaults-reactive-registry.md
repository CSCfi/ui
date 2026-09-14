---
status: accepted
---

# App-wide prop defaults through a reactive registry

Consumers set a **defaultable prop** once for every instance of a tag — `labelOnTop` on every `c-text-field`, one `texts` translation for every `c-select` — with `applyDefaults(defaults)` / `resetDefaults(tags?)`, exported next to `applyTheme` from both packages. Only props tagged `@defaultable <built-in>` in their SFC take part; the analyzer derives the typed `AppDefaults` map and the `DEFAULTABLE_PROPS` allow-list from those tags. A participating prop declares `undefined` in `withDefaults` and resolves through one shared helper (`src/shared/appDefaults.ts`): **host attribute → own property → app default → built-in default**. The registry is a module-level `reactive()` object, so changing a default re-renders mounted elements.

## Context

Every prop resolved per instance from `withDefaults`. An app that wants labels on top everywhere, or its own language on every list field, had to repeat the prop on each element or wrap every component per framework. The only app-wide runtime knobs were colour theming (ADR-0011) and theme mode.

Two Vue `defineCustomElement` facts shape the mechanism. A Boolean prop with `default: false` resolves to `false` when unset, indistinguishable from an explicit `false`, so an app default could never be told apart from an instance opting out; with `default: undefined` (key present) Vue skips the absent-Boolean cast and the prop resolves to `undefined`. And Vue writes a resolved default back onto the host as an attribute (`size="default"`, `items-per-page="6"` on every field today); for `undefined` that write-back is a no-op. Default *factories* are cached once per instance and are not reactive, so they cannot carry a live default.

## Decisions

- **A module-level reactive registry, read through `useAppDefault`, not provide/inject.** The library coordinates through module singletons (`modalStack`, `popoverChain`, `applyTheme`) and uses no Vue dependency injection. `configureApp` + `app.provide` would have worked per element app, but a per-element context is not live for trees already mounted and adds cross-shadow-root prototype chaining for no gain.
- **An explicit allow-list via `@defaultable`, with the built-in literal in the tag.** Preference props (`labelOnTop`, `hideDetails`, `shadow`, `size`, `itemsPerPage`, `texts`) qualify; per-instance data (`value`, `label`, `items`) does not. The tag's literal is the documented default — the manifest, IDE data and props table keep showing it — because the `withDefaults` entry must be `undefined`. The strict analyzer keeps tag, `withDefaults`, the `appDefault('<name>', <built-in>)` call and every template binding in step, so a stray `props.size` read or a shorthand `:size` cannot silently bypass the resolver.
- **Attribute-first resolution, uniform for Booleans, strings and numbers.** The existing `hideDetailsResolved` computeds already read the host attribute first because an attribute-supplied Boolean has been observed to reset on the wrapper's re-render. Property writes reflect to attributes (`el.size = 'small'` writes `size="small"`), so one order serves every scalar. Boolean coercion is applied after the layer is chosen (`coerceBoolean(undefined)` is `false` and would swallow the fallthrough).
- **`texts` is stored whole in the registry and merged key by key at the element** (built-in ← app default ← own), so a partial translation keeps the English fallbacks and a per-instance object still wins per key.
- **Fail loud, SSR no-op.** An unknown tag or a non-defaultable prop throws (developer-facing, like `applyTheme`); the generated `DEFAULTABLE_PROPS` is the runtime allow-list. `applyDefaults` returns after validation when `document` is undefined — a module-level registry must not leak across server requests, and custom elements never render on the server.
- **Wave 1 scope:** `labelOnTop`, `hideDetails`, `shadow`, `size` on c-text-field, c-select, c-autocomplete, c-tree-select; `itemsPerPage` on the three list fields; `texts` on those three and c-data-table. `hideDetails` on c-otp-input / c-checkbox / c-radio-group / c-pagination, `size` on c-pagination, and a `c-input` bucket for consumers using the inner field directly are deferred; each is a tag plus one line of wiring with no API change.

## Considered options

- **`configureApp` + provide/inject**: idiomatic Vue, but the library has no DI today, the provide happens per element app (not live for mounted trees), and nested-element context chaining across shadow roots is a second mechanism to understand.
- **Default factories** (`default: () => registry.x`): evaluated once per instance and cached; later changes never apply, and the resolved value is reflected onto the host as an attribute.
- **An ancestor context element** (defaults on `c-main` or a `c-config`, discovered on connect): scoped defaults per region, but more markup, composed-tree lookups across shadow boundaries, and nobody asked for scoping. The registry does not preclude adding it later.
- **Consumer wrapper components**: works today, but per framework and per component, and loses the plain tag in templates — the problem being solved.
- **CSS-only**: these props change structure and behaviour (label placement, hint row, list length, strings), not styling.

## Consequences

- Unset defaultable props now read `undefined` on the element (`el.labelOnTop`, `el.size`, `el.itemsPerPage` were `false` / `'default'` / `6`), and hosts no longer carry the reflected default attributes (`size="default"`, `items-per-page="6"`). Consumer CSS keyed on such an attribute would stop matching.
- A `@defaultable` prop's `withDefaults` value is `undefined` by contract; the built-in lives in the tag and in the `appDefault()` call, and lint enforces their agreement.
- The props table marks defaultable props with an "app default" badge; the Customization page owns the walkthrough and a live playground that resets its own tags on unmount.
- `src/tag-name-map.ts` gains one value export (`DEFAULTABLE_PROPS`) and is no longer types-only.
