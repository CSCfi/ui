# c-autocomplete: content nested in a slotted option renders stale (icons appear only after typing)

## Context

The docs example `packages/csc-ui-documentation/app/examples/c-autocomplete/multiple.vue` now puts a `<c-icon :path="option.icon" />` beside the `c-option-value` inside each `c-option`. The icons are missing when the panel opens and appear only after a query is typed (and, by the same mechanism, vanish again when the query is cleared).

**Root cause — verified read-only on 2026-09-09 against Vue 3.5.39 and the built bundle (`packages/csc-ui/dist/csc-ui.js`, built the same day).**

1. `c-autocomplete` never renders the slotted `c-option` elements in place. It reads them via `host.querySelectorAll('c-option')` and renders each row from a **cached `outerHTML` snapshot** (`normalizedOptions`, `CAutocomplete.vue:852-870`, `html: el.outerHTML` at :865) through `v-html` (:256). `outerHTML` carries attributes only — never JS properties, never shadow DOM — so the copy inside the panel re-creates `<c-icon>` and must find its `path` as an attribute.
2. In Vue 3.5.39 a bound prop on a Vue custom element is set as a **JS property** before connect (`runtime-dom` `patchProp` :808-814 via `shouldSetAsPropForVueCE`); the constructor (:891-936) does not resolve props. The property becomes an attribute only in the element's own `connectedCallback` → `_resolveDef` → `_resolveProps` → `_setProp` reflect (:1032, :1076-1093, :1128-1141). So the light-DOM `<c-icon>` reads `<c-icon></c-icon>` until *its* connectedCallback runs.
3. When Vue inserts the example subtree, custom-element reactions run in tree order — `c-autocomplete` first. Its `onMounted` → `refreshOptions()` (:1619-1631) flips `optionElementsExist` and queues the two **pre-flush watchers** on `filteredOptions` (:1560, :1573). Then the *first light-DOM `c-option`* mounts; Vue's `render()` calls `flushPreFlushCbs()` with no instance filter (`runtime-core` :6862+), which runs those watchers — their source getters evaluate `filteredOptions` → `normalizedOptions` and snapshot every option's `outerHTML` **before any nested `c-icon` has connected**. Snapshot: no `path`.
4. The slot `MutationObserver` (:1678-1682) watches `childList` + `characterData` only, so the later `setAttribute('path', …)` never invalidates the cache. Typing goes through `markedOptionHtml` (:949-968, a fresh `cloneNode(true).outerHTML`) → icons appear; an empty query falls back to the stale `o.html` (:984).

**Headless proof (chromium-1223 + CDP, static demo mirroring Vue's property-then-insert order):**

| bundle | row `c-icon` at mount | after pick / unpick | later `.path` / `.disabled` change on a light-DOM option |
| --- | --- | --- | --- |
| dist as built | `path` attr null, no svg `d` | unchanged | not propagated |
| dist + `attributes: true` on the observer | `path` + `d` present | icons kept, exactly one refresh per pick, count stable after 1 s idle | row updates (new `d`, `aria-disabled="true"`) |

`c-select` renders the same markup correctly with the unpatched bundle: `c-dropdown` reads `opt.outerHTML` live at render time (`CDropdown.vue:97`) and its render lands after the connect burst. No change there.

## Change

### 1. `packages/csc-ui/src/components/c-autocomplete/CAutocomplete.vue` — observe attributes

At :1678-1682 add `attributes: true`:

```ts
childObserver.observe(host, {
  attributes: true,
  characterData: true,
  childList: true,
  subtree: true,
});
```

Replace the comment above it (:1676-1677) with why both are needed: `characterData` for a `{{ text }}` edit inside a `c-option-value`; `attributes` because a component nested in an option (a `c-icon` with a bound `path`) reflects its props to attributes only in its own `connectedCallback`, after this component has already serialized the option for its rows — and because an option's `disabled` / `value` / `name` live in attributes too. Also touch the comment at :848-849 (`optionsVersion`) so it says the observer re-reads on child *and attribute* changes.

`refreshOptions()` is idempotent and its value seeding is guarded (`value.value == null` / `!selectedValues.value.length`), so the extra invocations — one batched refresh at mount for the reflection burst, one per pick from `syncOptionElements` reflecting `selected` — are safe (measured, see table). Only the toggled row's HTML string changes, so Vue re-injects just that row.

**Deliberately not applied to `c-select`** (`CSelect.vue:1364-1368`): it does not have the bug, and its `refreshOptions` re-emits the selection unguarded (`emitValue` at :1332-1338), so attribute mutations from its own `selected` reflection would emit `changeValue` on every pick and risk a v-model feedback loop. Leave as is; if a live attribute change on a `c-select` option ever needs to propagate, guard the emit first.

### 2. `docs/adr/0045-c-option-value-is-the-option-label-region.md` — amend the consequence at line 96

Extend the bullet "The option observers also watch `characterData` …": `c-autocomplete`'s observer also watches `attributes`, because a component nested in an option reflects a bound prop to an attribute only in its own `connectedCallback`, after the parent has already serialized the option's `outerHTML` for its rows (its cached row copy would otherwise never catch up). One sentence; ADR stays otherwise untouched (the "rows are derived … stays cacheable" decision at :74-77 holds — the cache is now invalidated correctly).

### 3. `packages/csc-ui/src/components/c-autocomplete/usage.md` — one paragraph under "Options"

After the `c-option-value` example (after line 17), state the authoring contract the serialization implies: the row shows a copy of the option's markup re-created from its HTML inside the panel, so a component nested in an option (a `c-icon`, say) is configured through attributes / primitive props — object props and listeners on option content do not carry over — and page CSS does not reach the copy: give the content a `part` and style it with `c-autocomplete::part(<name>)`. Mirror the same paragraph in `c-select/usage.md` under its "Options" section (c-select already forwards any `part` found inside a slotted option via `syncExportedParts`, `CSelect.vue:1262-1291`, but never documents it). Prose lives only in `usage.md` (ADR-0026); vocabulary per `CONTEXT.md`: *option*, *option label*, *label region*, *row*.

### 4. Docs example `multiple` — finish all four flavors

Keep the user's `.vue` (data-driven options, `c-icon :path`). Styling of the wrapper — **decided with Oskari 2026-09-09: `part` + `::part()`** — replace `class="flex items-center gap-2 justify-between"` with `part="language"` and add

```vue
<style>
/* Option content is copied into the panel: page classes do not reach it,
   the `part` does. */
c-autocomplete::part(language) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
</style>
```

Reason: the Tailwind utilities only render in the docs because csc-ui's own stylesheet happens to contain those four classes (`@source './components/**/*.vue'`); a consumer's page classes never reach the shadow row, so the example as written would not work when copied.

Bring the siblings to parity (the parity script `scripts/check-example-parity.mjs` only checks presence and explicit Vue imports, so parity is by convention):

- `multiple.react.tsx`: `CIcon` from `@cscfi/csc-ui-react`, `@mdi/js` imports, an options array, `<CIcon path={option.icon} />`, `<style>{styles}</style>` pattern as in `c-accordion-item/custom-header.react.tsx`.
- `multiple.angular.ts`: options array on the component, `@for` over it, `[path]="option.icon"`, `styles: [...]` with the `::part` rule.
- `multiple.typescript.html` + `multiple.typescript.ts`: `<style>` block + `<c-icon>` per option; set each icon's `path` property from `@mdi/js` in the `.ts` (or inline the path strings as attributes — pick whichever reads better; the `.ts` already sets `value` as a property).

The working tree also carries unrelated uncommitted docs-lint work (`_plan/docs-lint-formatting-gate.md` and its changeset); leave those files alone and do not commit unless asked.

### 5. Changeset

New file `.changeset/autocomplete-option-content-attributes.md` (`pnpm changeset` or by hand), `patch` for both `@cscfi/csc-ui` and `@cscfi/csc-ui-react` (fixed group). User-facing, high-level:

> Fix(c-autocomplete): a component nested in a slotted option — a `c-icon` with a bound `path`, for instance — renders in the panel as soon as it opens, not only after a query is typed. Changing an option's `disabled`, `value` or the attributes of its content after mount now updates its row as well.

Docs-only changes need no changeset (the docs package is ignored by changesets).

## Verification

There is no unit-test runner in `packages/csc-ui` (no vitest config, no spec files), so verification is a build plus a headless browser check.

1. `pnpm ui build` (tokens → tag map → vite → `vue-tsc` types → strict manifest). Manifest must be unchanged (no API change). Don't run it while the docs dev server is up (`vue-tsc` OOM, see memory).
2. Headless regression check against the rebuilt `dist/csc-ui.js` — recreate the CDP harness in the scratchpad (recipe in memory `project_csc_ui_next_visual_verify`; chromium at `/ms-playwright/chromium-1223/chrome-linux/chrome`, serve dist over `http://127.0.0.1`, build the `c-autocomplete > c-option > div > c-option-value + c-icon` subtree detached, set `icon.path` as a **property**, insert once, double rAF). Expect: every panel row's `c-icon` has the `path` attribute and an svg `path[d]` at mount; clicking a row picks it and keeps the icons; setting `.path` / `.disabled` on a light-DOM option updates its row; refresh count stays flat after 1 s idle. Also assert `getComputedStyle(row div[part=language]).display === 'flex'` under a `c-autocomplete::part(language)` rule to confirm the example's styling approach.
3. `pnpm dev` → http://localhost:3500 → c-autocomplete page → *Multiple* example: icons visible on first open, still visible after typing and after clearing the query; flavors tabs show the matching code.
4. `pnpm --filter @cscfi/csc-ui-documentation lint:examples`, and `pnpm ui lint:tokens` / `lint:a11y` (cheap, unaffected).
