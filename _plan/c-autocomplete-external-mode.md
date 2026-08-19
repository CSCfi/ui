# CAutocomplete: external (async) data mode + docs

> **Status: implemented 2026-08-19** (ADR-0029). Verified: library + react +
> docs builds, lint:tokens/a11y, example parity, and a headless functional
> pass of both modes (query emissions, loading row, label cache).

## Context

4.x `CAutocomplete` always filters `items` internally and never exposes the typed query — fetching options from an API as the user types is impossible (the only workaround, `:filter="() => true"` + swapping items, breaks on query reset, blank labels, and a false no-results row). This was a deliberate 4.0 cut (`_plan/csc-ui-next-autocomplete.md:11-13` dropped 3.x's `query`/`changeQuery`/`minimumQueryLength`), but the async workflow is needed (MyCSC's pending "autocomplete query API" item). Goal: re-add the consumer-owns-filtering contract in 4.x idiom, mirroring `c-data-table`'s `external` precedent, with a full docs example.

Verified enablers: colon-named events already flow end-to-end (`change:page` is in `dist/custom-elements.json`, `src/tag-name-map.ts`, and the React generator's `reactEventName` splits on `[:-]` → `onChangeQuery` comes for free). Vue SFC `@change:query` binding is proven by `c-data-table/external-data.vue:15`. No test infra exists in the repo — verification is builds + lints + docs dev server. Next ADR number: 0029.

## Decisions (from grilling session)

1. **`external` boolean prop + `change:query` event** — mirrors c-data-table's contract ("renders data verbatim, only emits state-change events"). Rejected: Vuetify-style `no-filter`, function-prop `itemsSource` (DOM-property-only, hostile to no-build/Angular flavors).
2. **`change:query` emits always** (both modes), detail = query string; `external` only gates internal filtering.
3. **Panel open resets query to `''` and emits `change:query('')`** — consumer restores the default list; makes external mode self-starting (no onMounted fetch needed). Note: internal-mode consumers also get this event on open.
4. **Closed-field label resolution order**: (1) lookup in current items → (2) label cached at commit → (3) `value.name` for object values (`return-object`) → (4) `String(value)`.
5. **Panel loading**: while `loading`, suppress no-results; keep stale options rendered during refresh; spinner + "Loading" info row only when list is empty. Field spinner unchanged.
6. **No component-side debounce, no `minimumQueryLength`** — consumer-side, demonstrated in the example.
7. Docs: external example (all flavors) + restore custom-filter example + usage.md prose + migration guide fix.
8. Records: ADR-0029; CONTEXT.md terms "External (mode)" + "Query" and fix the `changeValue` drift. Delete c-dropdown's dead 3.x query machinery.

## Implementation

### 1. `packages/csc-ui/src/components/c-autocomplete/CAutocomplete.vue`

- **Prop** in `CAutocompleteProps` (~:217, alphabetical, JSDoc required by strict analyzer): `external?: boolean` — "The consumer owns filtering: the component renders `items` verbatim and only emits `change:query` as the user types. Pair with `loading`; `filter` is ignored." Default `false` in `withDefaults` (:411-432); resolve via `const externalOn = computed(() => coerceBoolean(props.external))` like `CDataTable.vue:623`.
- **Event** in `CAutocompleteEvents` (:321-346): `'change:query': string` with JSDoc noting it fires on every keystroke and with `''` on panel open. Lowercase-kebab per ADR-0017; `useHostEmit` dispatches it as-is, no twin (same as `change:open` in `CMenu.vue:69-82`).
- **Emission**: add `setQuery(next)` helper beside the `query` ref (:461) that writes + emits only on actual change. Use in `onSearchInput` (:786), the printable-char opener (:750-764), `onReset` (:619). In `onToggle`'s open branch (:672) emit `change:query('')` **unconditionally** (even if query was already empty) — this is the self-starting open contract.
- **Filter bypass** in `filteredOptions` (:558): `if (externalOn.value || !q) return normalizedOptions.value;`
- **Label cache**: `committedLabel = ref<{label, value} | null>` — set in `commit()` (~:598), cleared in `onReset()` (~:620). Replace `displayLabel` (:581-588) with the 4-step resolution keyed on the committed value (so an externally-set v-model never shows a stale cached label; the `props.value` watcher at :454 stays untouched — respects `emitModelValue`'s re-entrancy rule).
- **Loading row** (template :139-149): new `<li v-if="loading && !filteredOptions.length" part="info">` with `<c-spinner :size="18" color="var(--c-primary)" />` + "Loading"; existing no-results row becomes `v-else-if`. `c-spinner` already imported. Update the `@csspart info` docblock (:299).
- **A11y**: in `updateStatusText` (:868-881) announce "Loading results" when loading with empty list. Add a `watch([filteredOptions, () => props.loading])` that (when open) re-seeds `activeIndex` if it points past/at a removed or disabled row and calls `updateStatusText()` — async item arrival otherwise leaves `aria-activedescendant` dangling (today re-seeding only happens in `onSearchInput`'s rAF, before async results land).

### 2. `packages/csc-ui/src/components/c-dropdown/CDropdown.vue` — dead-code deletion

Delete :308-380 (`highlightMatchingText`, autocomplete branch of `optionHtml`, `minimumQueryItem`, `emptyItem`) and template rows :41-52; replace `v-html="highlightMatchingText(item.name)"` (:104) with `{{ item.name }}`. Verified: only `CSelect.vue` uses c-dropdown (`type="select"`); c-select never sets those parent fields. Leave the now-unreachable `type === 'autocomplete'` enum member for a separate cleanup (keep diff scoped).

### 3. Rebuild + wrappers

- `pnpm ui build` — regenerates `src/tag-name-map.ts` and `dist/custom-elements.json`; expect `change:query` + `external` on c-autocomplete. No `src/index.ts` change (no new exported type; detail is plain `string`).
- `pnpm --filter @cscfi/csc-ui-react build` — generated `src/components.ts` gains `onChangeQuery`. Never hand-edit.

### 4. Docs examples — `packages/csc-ui-documentation/app/examples/c-autocomplete/`

- **`external.vue`** (canon) modeled on `c-data-table/external-data.vue`: pretend server (`setTimeout` 600 ms + `.includes` filter over ~10 static `{name, value}` rows), `external` + `:items` + `:loading` + `@change:query`, consumer debounce (300 ms) with cleanup in `onBeforeUnmount`, and a `requestId` guard dropping superseded responses (documented idiom — keep in all flavors). Comment that the open-reset `''` emit triggers the initial load. Explicit imports (parity script rejects Nuxt auto-imports).
- Variants: `external.react.tsx` (`// @ts-nocheck`, `onChangeQuery={...}`, pattern-match `external-data.react.tsx`), `external.angular.ts` (`addEventListener('change:query', ...)` in `ngAfterViewInit`, `el.items = ...` DOM property), `external.typescript.html` + `.ts` (querySelector + addEventListener).
- **`custom-filter.vue`** + 4 variants: adapt the recovered 3.x example (`git show 84882b8b^:.../CustomFilter.vue`) — typed `CAutocompleteFilter` const, contains-vs-starts-with framing, inline item list, imports from `@cscfi/csc-ui`. Angular/TypeScript flavors set `el.filter` as a DOM property.

### 5. `packages/csc-ui/src/components/c-autocomplete/usage.md`

Keep the intro paragraph verbatim (it's the manifest description, ADR-0026). Append `## Filtering` (default starts-with predicate; `filter` prop) and `## External data` (external + change:query + loading; fires with `''` on open; no built-in debounce/minimum length — debounce consumer-side; label survives items swaps via commit cache / `value.name`).

### 6. `packages/csc-ui-documentation/app/content/migration.ts:473-474`

Replace the c-autocomplete bullet: document removal of 3.x `query` prop, `changeQuery` event, `minimum-query-length(-message)` → use `external` + `change:query`; `noMatchingItemsMessage` → `no-results-text`. Keep the "no longer built on c-dropdown" sentence; scope "events unchanged" to option/value events only.

### 7. Records

- **`docs/adr/0029-external-data-mode-on-c-autocomplete.md`** (house format, Date 2026-08-19, Accepted, "Amends ADR-0009"): decision = external + always-on change:query mirroring c-data-table; alternatives rejected (component-owned fetching, no-filter, function prop); debounce/min-length consumer-side; label resolution chain; consequence: supersedes ADR-0009's note that c-dropdown's autocomplete machinery "remains for any future dialog-style autocomplete" — deleted.
- **`CONTEXT.md`**: add "External (mode)" and "Query" entries near "Search input"; fix drift at :29/:33 where entries imply `changeValue` is gone (it's the grandfathered canonical value event + `change-value` twin, ADR-0017/0021).

### 8. Changeset

`.changeset/<slug>.md`, minor for both fixed packages (`@cscfi/csc-ui`, `@cscfi/csc-ui-react`); high-level user-facing wording: external prop, change:query event, panel loading row; default behavior unchanged; note change:query fires with `''` on open. (Repo is in changesets pre mode / alpha — no extra action.)

## Verification

1. `pnpm ui build` (strict manifest catches missing JSDoc); diff `dist/custom-elements.json` + `src/tag-name-map.ts` for the new prop/event; c-dropdown diff only deletions.
2. `pnpm --filter @cscfi/csc-ui-react build`; check `onChangeQuery` in generated diff.
3. `pnpm ui lint:tokens && pnpm ui lint:a11y`.
4. `node packages/csc-ui-documentation/scripts/check-example-parity.mjs` — both example families complete.
5. `pnpm dev` (docs :3500) manual pass: internal mode unchanged; external example: open → `''` emit → loading row → initial list; type → debounced refetch, stale options stay visible; select; close/reopen → field label persists after items swap; clear; custom-filter example matches mid-word. Eyeball c-select page after the c-dropdown deletion.
6. `pnpm --filter @cscfi/csc-ui-documentation typecheck` is flaky (known hoisting issue) — rely on the docs build instead if it misbehaves.
