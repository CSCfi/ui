# Plan: app-wide prop defaults (`applyDefaults` / `resetDefaults`)

> Status: implemented 2026-09-11 (ADR-0048, changeset `app-defaults`). Wave-1 scope shipped; the deferred items are listed under "Out of scope".


## Context

Consumers of `@cscfi/csc-ui` want to set a prop once for every instance of a tag. The motivating case is `labelOnTop: true` on every `c-text-field` in an app; the same need covers one `texts` translation object for every `c-select` / `c-autocomplete` / `c-tree-select` / `c-data-table` (runtime i18n today means `:texts.prop` on every instance).

Nothing like this exists. The only app-wide runtime knobs are colour theming (`applyTheme` / `resetTheme` / `themeToCss`, ADR-0011) and theme mode. Every prop resolves per instance from `withDefaults` in the SFC; the only workaround is a per-framework wrapper component.

Decisions taken with the user (2026-09-11):

- **Explicit allow-list.** Only props tagged `@defaultable` in the SFC participate. Per-instance data props (`value`, `label`, `items`) stay out.
- **First wave:** `labelOnTop`, `hideDetails`, `shadow`, `size` on the four fields built on `c-input` (c-text-field, c-select, c-autocomplete, c-tree-select); `itemsPerPage` on c-select, c-autocomplete, c-tree-select; `texts` on c-select, c-autocomplete, c-tree-select, c-data-table. **Not** in this wave (user's call): `hideDetails` on c-otp-input / c-checkbox / c-radio-group / c-pagination, and a `c-input` bucket for consumers using `<c-input>` directly. Both can be tagged later with zero API change; say so in the ADR and docs.
- **Naming:** `applyDefaults(defaults)` / `resetDefaults(tags?)`, type `AppDefaults`. Mirrors `applyTheme` / `resetTheme`: verb-first, merge-with-previous, paired reset.

Mechanism decisions:

- A **module-level reactive registry** (`src/shared/appDefaults.ts`), read by components through one helper. Changes after mount propagate live (needed for language switching). Not Vue provide/inject via `configureApp`: the library uses zero Vue DI today and coordinates through module singletons (`modalStack.ts`, `popoverChain.ts`, `applyTheme.ts`).
- Participating props switch their `withDefaults` value to **`undefined`** so "not set" is distinguishable from an explicit `false` / `'default'` / `6`. Resolution order per prop: **host attribute → own property (non-nullish) → app default → built-in default**.
- The **built-in default moves into the `@defaultable` tag comment** (`@defaultable false`) so the manifest, IDE data and docs props table keep showing it. The same literal is passed to the helper in the SFC; a strict lint rule keeps the two in step.
- **Fail loud** like `applyTheme`: unknown tag or non-defaultable prop throws. This needs a generated runtime allow-list (`DEFAULTABLE_PROPS`) next to the generated `AppDefaults` type.

## Why this works (verified against Vue 3.5.39 sources and the shipped dist)

- `withDefaults(defineProps<P>(), { labelOnTop: undefined })` compiles to `{ type: Boolean, default: undefined }` (key present; 29 such entries already exist in `dist/csc-ui.js`, e.g. `autocorrect`, `maxTags`). In `resolvePropValue`, `hasOwn(opt, 'default')` is true, so the absent-Boolean cast to `false` is skipped: an unset prop resolves to `undefined`. `props.labelOnTop` types as `boolean | undefined`.
- Vue writes resolved defaults back onto the host as attributes (`instance.ce._setProp(key, value)` with reflect). Today every `<c-text-field>` therefore carries `size="default"` and every `<c-select>` `items-per-page="6"`. For `undefined` the change guard makes the write-back a no-op, so those stamps disappear after this change (note in the changeset).
- The property setter also reflects (`el.size = 'small'` writes `size="small"`, `el.labelOnTop = false` removes the attribute and stores `false`), so **one attribute-first resolution order is sound for Booleans, strings and numbers alike**, and it keeps the protection the existing `hideDetailsResolved` computeds provide against the "Boolean attribute resets on re-render" quirk (`CSelect.vue:466-478`).
- Property `el.x = undefined` and attribute removal both end as `undefined` → app default applies. `@lit/react` (`create-component.js`) sets `el[prop] = undefined` for an explicit `undefined` and for a prop that disappears between renders, so React behaves the same.
- `defineElement.ts` `booleanPropKeys` / `numberPropKeys` filter on `type` only → unaffected (`itemsPerPage` keeps Number coercion).
- Default *factories* are cached per instance (`propsDefaults`) and not reactive → rejected as the mechanism.
- Hazard: `coerceBoolean(undefined) === false` (`src/shared/coerceBoolean.ts`). Resolve the layer (`?? app ?? builtIn`) **before** coercing.
- Hazard: the existing `hideDetailsResolved` computeds read `props.hideDetails` only in the untaken branch, so with the attribute present they have zero reactive deps and never re-run. The helper reads `props[key]` unconditionally first.

## Steps (in dependency order)

The generated `AppDefaults` type comes *from* the `@defaultable` tags and `appDefaults.ts` imports it, so: analyzer → tag SFCs → regenerate tag map → helper → wire components → exports → build gates → docs → ADR/glossary/changeset. Between "tag SFCs" and "wire components" run the analyzer non-strict (`pnpm docs:tag-map`); the symmetry lint fails until wiring is done.

### 1. Analyzer (`packages/csc-ui/scripts/analyzer/`)

**`script-api.mjs`**
- Add `defaultableTag(member)` as a sibling of `freeformTag` (L26-41), same `ts.getJSDocTags` shape. Returns the trimmed comment (the built-in literal), `true` when the tag has no comment (lint errors on it), `undefined` when absent.
- In the `withDefaults` visitor (L172-186) keep `defaults` (still drops `'undefined'` for the manifest) and add a second map `declared` recording every key's raw text including `'undefined'`; pass it into `interfaceMembers` (L85-109).
- Prop record gains `defaultable` and `withDefault: declared.get(name)`; `default` becomes `defaults.get(name) ?? (typeof defaultable === 'string' ? defaultable : undefined)` so the tag literal is the manifest default.

**`cem.mjs`** — `typeCsc()` (L30-37): add `...(prop.defaultable ? { defaultable: true } : {})`; it already feeds both `field()` and `attribute()`. Update the header comment (L6-11) to list `csc.defaultable`. IDE data needs no change (the third-party generators read the CEM `default`).

**`index.mjs`** — add `templateSource: descriptor.template?.content ?? ''` to the component record (L190-208) so lint can check template bindings.

**`lint.mjs`** — new hard errors after the `@freeform` loop (L146-158); document them in the header (L1-34):
- `@defaultable` without a literal;
- `withDefault !== 'undefined'` (a missing key counts: an absent Boolean default resolves to `false`, never `undefined`);
- literal shape vs prop type (`true|false` ↔ `boolean`, numeric ↔ `number`, quoted ↔ string union, `{}` ↔ object);
- symmetry with the SFC script: `useAppDefault('<tag>', props)` present iff the component has a `@defaultable` prop and the literal equals `component.tagName`; every `@defaultable` prop has an `appDefault('<name>', <literal>)` call whose scalar literal equals the tag literal (skip the value comparison for `{}`, where the call passes the `DEFAULT_TEXTS` identifier); every `appDefault('<name>'` call names a tagged prop;
- no stray reads left: `/\bprops\.<name>\b/` in the script; in `templateSource`, a shorthand `:<kebab>` followed by whitespace, `/` or `>`, or a binding whose value is `<camel>`, `!<camel>` or `props.<camel>`. (A leftover shorthand `:size` hands `undefined` to `c-input`, whose own default then silently wins.)

**`tag-map.mjs`** — in `renderTagNameMap` after the element blocks (L314), before `declare global` (L340), emit for components with ≥1 `@defaultable` prop:

```ts
/** Props a consumer may set app-wide with `applyDefaults()` (`@defaultable`), typed as the element's own members. */
export interface AppDefaults {
  'c-autocomplete'?: Partial<Pick<CAutocompleteElement, 'hideDetails' | 'itemsPerPage' | 'labelOnTop' | 'shadow' | 'size' | 'texts'>>;
  …
}
/** Runtime allow-list behind `applyDefaults` validation; same data as `AppDefaults`. */
export const DEFAULTABLE_PROPS = {
  'c-autocomplete': ['hideDetails', 'itemsPerPage', 'labelOnTop', 'shadow', 'size', 'texts'],
  …
} as const satisfies Record<keyof AppDefaults, readonly string[]>;
```

No new imports (the `C*Element` names are in the same file). Update the HEADER text (L20-30) to mention both. The drift check in `index.mjs:316-335` covers them. `tag-name-map.ts` stops being types-only; its `import type` lines erase, so the emitted JS is just the const and there is no runtime cycle (SFC → `appDefaults.ts` → `tag-name-map.ts`).

### 2. Tag the SFCs

For each prop: add `@defaultable <literal>` to the JSDoc in the plain `<script>` props interface and set the `withDefaults` value to `undefined`.

| File | Props (`@defaultable` literal) |
|---|---|
| `src/components/c-text-field/CTextField.vue` | `hideDetails false` (L171/395), `labelOnTop false` (L198/399), `shadow false` (L248/407), `size 'default'` (L250/408) |
| `src/components/c-select/CSelect.vue` | same four (L430/436/446/447), `itemsPerPage 6` (L434), `texts {}` (L448, currently `() => ({})`) |
| `src/components/c-autocomplete/CAutocomplete.vue` | same six (defaults L662-687) |
| `src/components/c-tree-select/CTreeSelect.vue` | same six (defaults L695-717) |
| `src/components/c-data-table/CDataTable.vue` | `texts {}` (L427/546) |

Then `cd packages/csc-ui && pnpm docs:tag-map` to regenerate `src/tag-name-map.ts` (commit it).

### 3. `src/shared/appDefaults.ts` (new)

Export `hyphenate` from `src/shared/defineElement.ts` (L106) instead of duplicating it.

```ts
import { computed, reactive, useHost, type ComputedRef } from 'vue';
import { type AppDefaults, DEFAULTABLE_PROPS } from '../tag-name-map';
import { coerceBoolean } from './coerceBoolean';
import { hyphenate } from './defineElement';

export type { AppDefaults } from '../tag-name-map';
export { DEFAULTABLE_PROPS } from '../tag-name-map';
export type DefaultableTag = keyof AppDefaults;
type Bucket<T extends DefaultableTag> = NonNullable<AppDefaults[T]>;

/** tag → { prop → app default }. Reactive: every resolved computed depends on it. */
const registry = reactive<{ [T in DefaultableTag]?: Bucket<T> }>({});

export function applyDefaults(defaults: AppDefaults): void {
  // 1. validate every tag/key against DEFAULTABLE_PROPS — throw (developer-facing, like applyTheme's seedVars)
  // 2. if (typeof document === 'undefined') return;  // SSR no-op: module state must not leak across requests
  // 3. merge per tag: value === undefined → delete registry[tag][key]; else assign. `texts` is one key, replaced whole.
}

export function resetDefaults(tags?: DefaultableTag[]): void {
  // delete the given tags' buckets, or every bucket when omitted
}

const defined = (o: object | null | undefined) =>
  Object.fromEntries(Object.entries(o ?? {}).filter(([, v]) => v !== undefined));

/**
 * Per-instance resolver. Call once in setup, then one line per defaultable prop:
 *   const appDefault = useAppDefault('c-text-field', props);
 *   const labelOnTopResolved = appDefault('labelOnTop', false);
 * Scalars: host attribute → own property (non-nullish) → app default → built-in.
 * Objects (`texts`): per-key merge built-in ← app default ← own.
 */
export const useAppDefault = <T extends DefaultableTag>(tag: T, props: object) => {
  const host = useHost();
  return <K extends keyof Bucket<T> & string>(
    key: K,
    builtIn: Required<NonNullable<Bucket<T>[K]>>,
  ): ComputedRef<Required<NonNullable<Bucket<T>[K]>>> =>
    computed(() => {
      const own = (props as Record<string, unknown>)[key]; // read FIRST — the reactive dependency
      const app = registry[tag]?.[key];                     // reactive dependency on the registry
      if (typeof builtIn === 'object')                      // texts
        return { ...builtIn, ...defined(app as object), ...defined(own as object) } as never;
      const attr = host?.getAttribute(hyphenate(key));      // stable across the Boolean-attribute reset quirk
      if (attr !== null) return fromAttribute(attr, builtIn) as never;
      if (own != null) return (typeof builtIn === 'boolean' ? coerceBoolean(own) : own) as never;
      return (app ?? builtIn) as never;
    });
};

const fromAttribute = (attr: string, builtIn: unknown): unknown => {
  if (typeof builtIn === 'boolean') return coerceBoolean(attr);            // '' → true, 'false' → false
  if (typeof builtIn === 'number') { const n = Number(attr); return attr.trim() !== '' && Number.isFinite(n) ? n : builtIn; }
  return attr;
};
```

Notes: the tag is a string literal per component (lint checks it against `tagName`); `K` is anchored on the generated `AppDefaults`, so `appDefault('size', 'default')` types as `ComputedRef<'default' | 'small'>` and `appDefault('texts', DEFAULT_TEXTS)` as `ComputedRef<Required<CSelectTexts>>`, i.e. today's `t`. `typeof builtIn` is the only discriminator; no per-prop metadata. A nullish own value means "unset" (slightly more forgiving than Vue, which treats `null` as explicit; document it). Move the long quirk prose from `CSelect.vue:466-478` / `CTextField.vue:422-426` into this file's header and leave one-line pointers.

### 4. Wire the components

Never shadow a prop with a same-named setup const. Follow the existing `hideDetailsResolved` / `multipleOn` convention: `labelOnTopResolved`, `shadowResolved`, `sizeResolved`, `itemsPerPageResolved`; keep `t` for texts.

Reference: `src/components/c-text-field/CTextField.vue`
- Import `useAppDefault` from `../../shared/appDefaults` (imports L307-323; drop `coerceBoolean` if unused).
- Replace L422-431 with:
  ```ts
  const appDefault = useAppDefault('c-text-field', props);
  const hideDetailsResolved = appDefault('hideDetails', false); // still forwarded via data-hide-details
  const labelOnTopResolved = appDefault('labelOnTop', false);
  const shadowResolved = appDefault('shadow', false);
  const sizeResolved = appDefault('size', 'default');
  ```
- Template L4 keeps `:data-hide-details="String(hideDetailsResolved)"`; L12/14/15 `:label-on-top` / `:shadow` / `:size` shorthands → `="labelOnTopResolved"` etc. `c-input` then always receives explicit values and never falls to its own defaults.
- L505 `if (props.labelOnTop)` → `if (labelOnTopResolved.value)`.

Same pattern, every direct read:
- `CSelect.vue`: resolver L479-483; `<c-input>` bindings L20/27/29/30; `:size` shorthands on the tag rows L84, L96 → `sizeResolved`; `:items-per-page` on `c-dropdown` (L9) → `itemsPerPageResolved`; L464 `const t = computed(...)` → `const t = appDefault('texts', DEFAULT_TEXTS)`. Keep `multipleOn` as is.
- `CAutocomplete.vue`: resolver L776-780; `<c-input>` L11/18/20/21; tag `:size` L66, L78; texts L707; `props.itemsPerPage` at L818 and the watch source at L1512.
- `CTreeSelect.vue`: resolver L808-812; `<c-input>` L11/18/20/21; texts L742; `props.itemsPerPage` at L1212 and the watch at L1579.
- `CDataTable.vue`: texts L621 only.

`c-input` (`CInput.vue`) is untouched: its `isHideDetails()` chain and the `data-hide-details` channel keep working, and `CDropdown.vue:490-500` still drives both channels on the inner c-input.

### 5. Exports

`packages/csc-ui/src/index.ts`, after the theming block (~L207), in the house style (prose comment, runtime export, blank line, type export):
```ts
// App-wide prop defaults: set a defaultable prop (`@defaultable` in the manifest)
// for every instance of a tag — labelOnTop on every text field, one `texts`
// translation per list field. Live: mounted elements re-render; an explicit
// per-instance attribute or property always wins.
export { applyDefaults, DEFAULTABLE_PROPS, resetDefaults } from './shared/appDefaults';

export type { AppDefaults, DefaultableTag } from './shared/appDefaults';
```
(`AppDefaults` also arrives via `export type * from './tag-name-map'`; an explicit export wins without conflict.)

`packages/csc-ui-react/src/index.ts` (hand-written, double quotes): add `applyDefaults`, `resetDefaults`, `DEFAULTABLE_PROPS` to a runtime re-export from `"@cscfi/csc-ui"` and `AppDefaults`, `DefaultableTag` to a type re-export.

### 6. Docs (`packages/csc-ui-documentation/`)

- `app/composables/useManifest.ts`: `CemMember.csc.defaultable?: boolean` (L27-35), `PropView.defaultable?: boolean` (L128-138), map `defaultable: m.csc?.defaultable ?? false` (L236-247).
- `app/components/ApiComponent.vue` default cell (L81-85): after `<code>{{ prop.default }}</code>` render a small badge when `prop.defaultable` (semantic tokens only, e.g. `bg-primary-subtle text-on-primary-subtle`, `title="Accepts an app-wide default via applyDefaults()"`). Under the table, when any prop is defaultable, one footnote line with a `c-link` to `/customization#app-defaults` (precedent: the Type cell's `c-link`, L47-77).
- `app/content/customization.ts`: overview (L53-63) title "Two axes" → "Three axes of customization" and a sentence on behaviour presets via `applyDefaults`. New section `app-defaults` ("App-wide prop defaults") after `parts`: an `appDefaultsCode(importSource)` helper modelled on `themingCode` (L34-47) showing `applyDefaults({ 'c-text-field': { labelOnTop: true }, 'c-select': { texts: {…} } })`, merge-with-previous, `undefined` clears, `resetDefaults(['c-select'])`; React block imports from `@cscfi/csc-ui-react`. Intro states precedence, the allow-list (badge in each props table), that `texts` in the registry is replaced as a whole but merged per key at the instance, and that `c-input` used directly is not covered yet.
- `app/pages/customization.vue`: bespoke insert next to L56-58: `<client-only v-if="section.id === 'app-defaults'"><app-defaults-playground /></client-only>`.
- New `app/components/AppDefaultsPlayground.vue` (modelled on `ThemePlayground.vue`): toggles for `labelOnTop` / `hideDetails` / `size` on `c-text-field` and a language toggle for `c-select` `texts`, demo fields inside the figure, and `onBeforeUnmount(() => resetDefaults(['c-text-field', 'c-select']))` so the SPA does not leak the demo into component pages.
- One sentence at the end of each `## Texts` section: `c-select/usage.md` (L73), `c-autocomplete/usage.md` (L124), `c-tree-select/usage.md` (L91): "To translate every field at once, set `texts` app-wide with `applyDefaults({ 'c-select': { texts } })` (Customization → App-wide prop defaults); a per-instance `texts` still wins key by key."
- Run `pnpm lint` in the docs package (eslint + prettier are strict since 651a2f68).

### 7. ADR-0048, glossary, changeset

- `docs/adr/0048-app-wide-prop-defaults-reactive-registry.md`, ADR-0011 shape (`status: accepted` frontmatter, title, summary, Context, Decisions, Considered options, Consequences). Decisions: module-level reactive registry read via `useAppDefault`, not DI; explicit allow-list via `@defaultable` with the built-in literal in the tag and `undefined` in `withDefaults`; precedence host attribute → own property → app default → built-in, uniform for scalars because Vue reflects property writes to attributes; `texts` merged per key at the instance, replaced whole in the registry; fail-loud validation via generated `DEFAULTABLE_PROPS`; SSR no-op; `c-input` and the non-c-input controls deferred. Considered options: `configureApp` + provide/inject (zero DI today, cross-root chaining, not live for already-mounted trees); default factories (cached once per instance); ancestor-scoped context element (markup + shadow-boundary lookups, nobody asked for scoping); consumer wrapper components (per framework, defeats the point); CSS-only (props are behaviour, not styling). Consequences: unset defaultable props read `undefined` on the element; reflected default attributes disappear; lint symmetry rules; docs badge.
- `CONTEXT.md`: new `### App defaults` heading after "Theming & dark mode" (L248) with **App default** (a value a consumer sets for every instance of a tag via `applyDefaults`; live; beaten by any explicit attribute or property. _Avoid_: global prop, preset, config, theme), **Built-in default** (the library's value when neither an explicit value nor an app default exists; lives in the `@defaultable` literal and the `appDefault()` call, never in `withDefaults`. _Avoid_: factory default, fallback, hard-coded default), **Defaultable prop** (a preference prop on the allow-list, tagged `@defaultable`, badged in the props table. _Avoid_: configurable prop, overridable prop, global prop). Add "Default" to Flagged ambiguities (L394-400): built-in default vs app default vs the `'default'` size value / tv `defaultVariants`.
- `.changeset/app-defaults.md`: both packages `minor`. Body: the API, the allow-list per tag, precedence, live updates, and the two visible changes (unset defaultable props read `undefined` on the element; hosts no longer carry reflected default attributes such as `size="default"` / `items-per-page="6"`).

## Verification (no test runner exists; gates are the builds)

1. `cd /workspace/packages/csc-ui && pnpm build` — tag map → vite → vue-tsc → `docs:manifest:strict` (lint rules, index re-export check, tag-map drift). While iterating on lint: `pnpm docs:manifest --only c-select`.
2. `cd /workspace/packages/csc-ui-react && pnpm build`.
3. `cd /workspace/packages/csc-ui-documentation && pnpm lint && pnpm build` (example parity + Nuxt build).
4. Behavioural check with the bundled chromium (`/ms-playwright/chromium-1223/chrome-linux/chrome`; recipe in memory `project_csc_ui_next_visual_verify`): serve `/` over HTTP (`python3 -m http.server`), a scratch page in the session scratchpad that imports `dist/csc-ui.js` + `dist/styles/css/tokens.css`, calls `defineCustomElements()`, and drives assertions over raw CDP (`Runtime.evaluate`, readiness flag, `requestAnimationFrame` after each change). Probe `field.shadowRoot.querySelector('c-input').hasAttribute('label-on-top')` etc. Cases:
   - unset → built-in (`false`); host carries no `size` attribute (reflection gone).
   - `applyDefaults({ 'c-text-field': { labelOnTop: true } })` → the already-mounted field flips live.
   - `<c-text-field label-on-top="false">` and `el.labelOnTop = false` both stay `false` under the app default; `el.labelOnTop = undefined` returns to the app default.
   - `applyDefaults({ 'c-text-field': { labelOnTop: undefined } })` clears; `resetDefaults()` restores the built-in.
   - `<c-select hide-details>` keeps `data-hide-details="true"` on its inner c-input across several value changes (quirk regression); app default `hideDetails: true` with no attribute yields `"true"`; `hide-details="false"` beats it.
   - `applyDefaults({ 'c-select': { texts: { toggleOptions: 'Vaihda' } } })` → `[aria-label="Vaihda"]` appears live in the select's shadow root; a per-instance `texts` with a different key keeps both.
   - `applyDefaults({ 'c-nope': {} })` and `{ 'c-text-field': { placeholder: 'x' } }` throw.
5. `pnpm dev` → `http://localhost:3500/customization#app-defaults`: toggle the playground, navigate to `/components/c-text-field`, confirm no leaked defaults and the badge + footnote in the props table.

## Risks and edge cases

- `coerceBoolean(undefined) === false`: the helper decides the layer before coercing; lint blocks stray `props.x` reads.
- Element readback: `el.labelOnTop`, `el.size`, `el.itemsPerPage` read `undefined` when unset (were `false` / `'default'` / `6`); reflected default attributes disappear from hosts. Consumer CSS keyed on `c-text-field[size="default"]` would break (unlikely; note in changeset).
- Hide-details quirk: data channel unchanged, helper stays attribute-first, wrappers keep passing explicit values to `c-input`.
- SSR: creating module-level reactive state on the server is fine; writing it per request is not → `applyDefaults` no-ops after validation when `document` is undefined.
- Docs SPA leakage: the playground resets its own tags on unmount.
- Internal composition: `c-data-table`'s inner `<c-checkbox hide-details>` (`CDataTable.vue` L35, L129) is pinned by attribute; any future defaultable tag used internally must be audited the same way.
- `texts` manifest default changes from `() => ({})` to `{}` (an improvement, but visible in IDE data).
- `DEFAULTABLE_PROPS` makes `tag-name-map.ts` a runtime module. If that is unwanted, drop the const and fail-loud validation and rely on TypeScript excess-property checks (plain-JS consumers then get silent ignores).

## Out of scope (record in ADR as follow-ups)

- `hideDetails` on c-otp-input / c-checkbox / c-radio-group / c-pagination and `size` on c-pagination: tag + one-line wiring each once wanted.
- A `'c-input'` bucket for direct `<c-input>` users.
- A `texts` prop on `c-pagination` (its strings are module constants today), which would then become defaultable.
- Scoped defaults per DOM region (ancestor context element).
