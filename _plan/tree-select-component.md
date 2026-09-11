# Plan: `c-tree-select` — hierarchical single-value picker

Source brief: `_todo/tree-select-component.md` (grilled 2026-09-11).

## Context

CSC's forms need a field for picking one node from nested classification data of arbitrary depth (e.g. a field-of-science taxonomy with codes). Neither `c-select` (flat list) nor `c-autocomplete` (flat, filterable) can express hierarchy. The brief proposes `c-tree-select`: one popover that combines a **stepper** (browse one level at a time with a breadcrumb) and **search** (type to list matching leaves with their ancestor path).

## Glossary tensions found in the brief (to resolve during grilling)

| Brief says | CONTEXT.md / repo says | Status |
|---|---|---|
| "Vue, React and Angular wrapper entries" | Exactly one wrapper exists: `@cscfi/csc-ui-react`, generated from the manifest. Angular/Vue/TS consume natively. | resolved — see Decisions / Brief corrections |
| "the field itself is a text input" | **Search input** is defined as living *inside* the open panel, separate from the readonly **value field** (c-autocomplete). Brief diverges. | resolved — see Decisions / Brief corrections |
| "Changelog entry" | Releases are changesets (ADR-0028); CHANGELOG is generated. | resolved — see Decisions / Brief corrections |
| "`items-per-page` half-row scrolling" | Canonical term: **peek**. | resolved — see Decisions / Brief corrections |
| "Query runs get the `match` part" | Canonical term: **match marking**. | resolved — see Decisions / Brief corrections |
| "Highlight the committed node's row" | "Highlighting" is reserved for the virtual active row (`aria-activedescendant`); the committed row is *selected*. | resolved — see Decisions / Brief corrections |
| "Breadcrumb", "crumb", "stepper", "level", "path", "node/branch/leaf" | New terms — none in glossary yet. | resolved — see Decisions / Brief corrections |
| "`change:path` event" | New lowercase event (ADR-0017) — fine; detail shape to settle. | resolved — see Decisions / Brief corrections |
| "Announce level changes with a live region" | c-autocomplete has an inline `aria-live="polite"` status div with a 1400 ms debounce (`CAutocomplete.vue:139–146`, `updateStatusText` :1530). No shared utility. | resolved — see Decisions / Brief corrections |
| "`changeValue` / `change-value`, `update:value`, `input`, `change` — same as c-autocomplete" | c-autocomplete carries the grandfathered triple via `emitModelValue`. A component born under ADR-0017 uses `emitModelChange(host, value)` (`src/shared/emitModelValue.ts:55–67`): bare `change` **with detail** + `update:value` + native `input`, no `changeValue`, no twin. | resolved — see Decisions / Brief corrections |
| "Tests matching the repo's existing test style" | **There are no tests and no test runner** in the repo (no vitest/playwright, no `test` script). The strict analyzer (`scripts/analyzer/lint.mjs`) + `vue-tsc` + lint scripts are the gates. | resolved — see Decisions / Brief corrections |
| "forwarding of consumer `part`s inside slotted options as c-select does" | Only needed when rows live one shadow root deeper (c-select → c-dropdown). c-autocomplete `v-html`s option `outerHTML` into its own shadow root, so consumer parts work for free. | resolved — see Decisions / Brief corrections |
| "Do not fork c-autocomplete's rendering wholesale if a shared internal can be extracted" | ADR-0009 records positioning/empty-state duplication as accepted; there is no shared popover composable today. Extracting one is a new ADR + touching c-autocomplete. | resolved — see Decisions / Brief corrections |
| "`filter` … case-insensitive substring" | c-autocomplete's default is `startsWith`, not `includes`. | resolved — see Decisions / Brief corrections |

## Facts established by exploration (c-autocomplete, `packages/csc-ui/src/components/c-autocomplete/CAutocomplete.vue`)

- Layout: exactly two files per component — the SFC and `usage.md`. Public types live in a non-setup `<script lang="ts">` block; event map interface inside `<script setup>`.
- Reusable shared helpers (`packages/csc-ui/src/shared/`): `peekCap.ts` (`applyPeekCap`), `splitMatches.ts`, `optionLabel.ts` (`optionLabel`, `optionValueElement`), `coerceBoolean.ts`, `useHostEmit.ts`, `emitModelValue.ts` (`emitModelValue`, `emitModelChange`), `anchorPolyfill.ts` (`ensureAnchorPositioning`), `SelectionIndicator.vue`, `selectAll.ts`, `positionArea.ts`, `popoverChain.ts` (c-popover only).
- Not shared (inline in the SFC, would be duplicated): popover open/close (`popover="manual"` + `showPopover()`, `@toggle` as single source of truth, :1259–1318), anchor `<span style="anchor-name">` + `panelStyle` (:809–815) + `@position-try` fallbacks (:1742–1755), light dismiss via capture-phase document `pointerdown` (:1603–1615), `applyListCap` wrapper (:823–844), `activeDescendantId`/`moveActive`/`scrollActiveIntoView`, status live region, field-row `tv` recipe.
- Field: renders `<c-input>` (:11–124) with `:active`, `:filled`, `:data-hide-details` (data channel because a direct binding collides), sanitized `inputId`. Value field is a readonly `<input role="combobox">` (no `aria-activedescendant`); search input sits inside the panel and holds DOM focus while open; rows are `tabindex="-1"` + `@mousedown.prevent`.
- Options: slotted `<c-option>` win over `items` (not merged); MutationObserver on host (`attributes, characterData, childList, subtree`) + `optionsVersion` counter. Selected row: `aria-selected` + trailing `mdiCheck` SVG (`ml-auto text-primary`), no part.
- Parts (12): `panel, card, search, list, item, select-all, indicator, mark, match, info, tags, tag, tag-root`. Static `part="match"` in template carries the contract for the JS-built slotted path.
- External mode: filtering skipped; `change:query` on every keystroke and unconditionally `''` on open; loading spinner in field + `info` row only when list empty; committed label remembered at commit time.
- Registration: `src/index.ts` (import, type re-exports :81–87, ordered define list :316, second tag list :415); `tag-name-map.ts` is generated (`scripts/analyzer/index.mjs --tag-map`); React wrapper hand-maintained event map at `packages/csc-ui-react/src/components.ts:162–170` (to confirm with agent 3); docs examples auto-discovered by glob.
- Analyzer hard rules (`scripts/analyzer/lint.mjs`): slot↔`@slot` 1:1, part↔`@csspart` 1:1, no raw `new CustomEvent`, `emitModelValue` callers must declare the triple, bare `string` props need `@freeform`, docblock prose is a warning.
- c-select's `optionAsSelection` clones the `<c-option>` into a selection overlay and hides the readonly input via CSS — the only precedent for a rich (two-line) closed value.
- `docs/adr/` is at 0046.

## Facts established by exploration (plumbing)

- **Hand edits for a new standalone component** are exactly four, all in `packages/csc-ui/src/index.ts`: alphabetical SFC import (lines 1–71), `export type {…}` block (74–186; the analyzer fails the build if a public type is not re-exported, `scripts/analyzer/index.mjs:282–310`), the ordered `components` array (246–330; order is load-bearing — `c-option-value`, `c-option`, `c-dropdown`, `c-select`, `c-autocomplete`), and `tailwindVariantTags` (351–429, legacy list, still append).
- Generated + committed: `src/tag-name-map.ts` (`pnpm docs:tag-map`; strict build fails if stale) and `packages/csc-ui-react/src/components.ts` (`pnpm --filter @cscfi/csc-ui-react generate`; manifest-driven, only opt-out is `INTERNAL_ONLY = {'c-dropdown'}`). React event prop: `change:path` → `onChangePath`.
- **No Angular wrapper exists.** Docs `angular` flavor shows native custom elements in a standalone component with `CUSTOM_ELEMENTS_SCHEMA` (e.g. `app/examples/c-autocomplete/external.angular.ts`).
- Docs: page/nav auto-discovered from the manifest; examples at `packages/csc-ui-documentation/app/examples/<c-tag>/<name>.vue` + `.react.tsx` + `.angular.ts` + `.typescript.html` (+ optional `.typescript.ts`); ordering alphabetical by filename; title from filename. Parity script `scripts/check-example-parity.mjs` (first step of docs build) also forbids Nuxt auto-import reliance in canons. `usage.md` is read from the **built** library (`dist/docs`).
- Analyzer discovery is filesystem-based; a new component directory needs zero analyzer registration. Missing `usage.md` is only a warning but leaves an empty description everywhere.
- Release: pre mode (`.changeset/pre.json`, tag `alpha`, current `4.0.0-alpha.11`). New component = new `.changeset/<slug>.md` bumping both packages `minor`; house-style precedent `.changeset/progress-circle-component.md`. CI requires a newly *added* changeset per PR.
- `_plan/` exists with 29 plan docs (closest precedents: `select-autocomplete-multiple.md`, `c-autocomplete-external-mode.md`, `c-option-value-label-region.md`, `csc-ui-next-autocomplete.md`). `_todo/circular-progress-component.md` is the analogous brief for the shipped `c-progress-circle`.
- ADR-0009 is the one describing c-autocomplete's arrangement (readonly value field + in-panel search input, not on c-dropdown); c-select is the field-moves-into-dialog arrangement (c-dropdown). A search-in-the-field arrangement would be a third, distinct one.
- Nested `<c-option>` inside `<c-option>` has no precedent; the `DropdownItem` shape is flat.

## Facts established by exploration (primitives)

- **`c-input` is the field shell** (no `c-field`/`useField`). Props: `active, disabled, errorMessage, filled, hideDetails, hint, inputId, isTextarea, label, labelOnTop, required, shadow, size, valid`. No `clearable/placeholder/readonly/value/name` — the wrapping component owns those. Slots `pre` / default / `post`; parts `root, label, pre, post, message`. Default slot takes arbitrary markup (c-select projects a whole content div with overlay, tag row, spinner, buttons), so a two-line closed value needs no new c-input API; the floating label lift is hardcoded (`-20px/-16px`) and the box is `min-h-11`/`min-h-9`, so a two-line value grows the box. `hide-details` must go through the `data-hide-details` channel.
- **`c-option` nesting is hostile today**: both parents use `host.querySelectorAll('c-option')` (descendant query), so a nested option would appear as its own flat row and be re-serialized inside its parent's row. Supporting it means `:scope > c-option` traversal in a new discovery helper.
- **`c-dropdown`** is a `<dialog>` + `showModal()` that moves the field into the dialog; real DOM focus on rows; not a fit (ADR-0009 reasoning applies).
- **No shared list-navigation / virtual-highlight composable** — three hand-rolled patterns (real focus in c-dropdown, `aria-activedescendant` in c-autocomplete, roving tabindex in c-menu). c-tree-select would be the second `aria-activedescendant` consumer.
- **Shared overlay helpers** in `src/shared/`: `anchorPolyfill.ts`, `positionArea.ts`, `popoverChain.ts` (c-popover only), `useDesignatedTrigger.ts`, `peekCap.ts`, `modalStack.ts`. c-autocomplete hand-rolls light dismiss (capture-phase document `pointerdown`) and does not join the popover chain.
- **No breadcrumb / tree component exists.** Closest hierarchy precedents: `c-menu`/`c-menu-item` submenus (peer panels), `c-side-navigation-item` (auto slot assignment for nested items), `c-sub-navigation-item` (hardcoded indent). Chevron idiom: inline `<svg><path :d="mdiChevronRight">` with `fill-current`; rotate recipe `rotate-0 transition-transform duration-300` + `rotate-180` variant.
- **Icons**: `@mdi/js` paths; inline `<svg>` inside rows (avoid nested custom elements in list rows); `c-icon-button` for clear/chevron affordances.
- **Live region**: inline `aria-live="polite" aria-atomic="true"` visually-hidden div + 1400 ms debounce is the house convention; `visuallyHidden` tv slot is re-declared in four components.
- **Value emission**: `emitModelValue` (grandfathered triple + twin) used by 11 components; **`emitModelChange` (`change` with detail + `update:value` + native `input`, no twin) used by `c-button-group` only** — the one value component born in 4.x. Both must be called only from interaction handlers, never from a `props.value` watcher.
- **c-autocomplete `return-object` emits a fresh `{ name, value }`**, not the original item reference (`CAutocomplete.vue:1166, 1205, 1651`).
- `tv()` slots map to parts manually and curatedly; internal slots carry no `part`. `:host { display: contents }` globally; field components override to `display:block` in the escape-hatch `<style>` (must carry a justification comment, ADR-0007). Two template roots (anchor wrapper + panel) ⇒ `defineOptions({ inheritAttrs: false })` mandatory; `lint:a11y` also demands it whenever `host.setAttribute('role'|'tabindex'|'id'|'aria-*')` appears.
- Boolean props supplied as attributes reset on re-render ⇒ resolve `allow-branch`, `external`, `hide-details` from the host attribute first via `coerceBoolean` (pattern at `CAutocomplete.vue:781–793`).
- `c-autocomplete`'s `placeholder` targets the in-panel search input; `c-select`'s is dead.

## Decisions (filled in as the grilling resolves them)

1. **Search input lives in the panel, like c-autocomplete (ADR-0009 arrangement).** Readonly value field (`c-input` + readonly `role="combobox"` input) opens a native-popover panel: search row on top, breadcrumb under it, then the level list, or the results list while a query is typed. Editable-combobox a11y is reused verbatim (DOM focus in the search input, virtual highlight via `aria-activedescendant`). Rationale: one interaction across the value-field family; the readonly field can render the two-line path + label without an overlay trick; no third field arrangement / no ADR needed for placement. Deviates from prototype 3a knowingly.
2. **Value events via `emitModelChange`** (`src/shared/emitModelValue.ts:58`): `change` (detail = value) + `update:value` + native bubbling `input`. No `changeValue`, no kebab twin (ADR-0017/0021). Precedent: `c-button-group`. Event map must declare exactly `change` / `update:value` / `input` (+ `change:query`, and any browse event decided below) or the strict analyzer fails.
3. **Tree source is the `items` property only.** No slotted / nested `<c-option>`, no `@subcomponents`, no MutationObserver, no outerHTML snapshots, no part forwarding. Rows render from data (code, label, child count, path). usage.md states the boundary; nested option authoring stays a possible later addition (additive, not ADR-worthy).
4. **Extract shared internals and refit c-autocomplete in the same change.** New composables in `packages/csc-ui/src/shared/`: `useAnchoredPanel()` (anchor style, `popover="manual"` open/close, `@toggle` as source of truth, width + message-offset measure, capture-phase light dismiss, focus return, `ensureAnchorPositioning`) and `useStatusAnnouncer()` (debounced 1400 ms polite live region). Both c-autocomplete and c-tree-select consume them. Virtual-highlight code stays per component (select-all pinned row special case). ADR-0009's "duplication accepted" consequence gets an amendment note (same style as the ADR-0029/0045 notes), not a new ADR.
5. **Verification = repo gates + an uncommitted scripted CDP smoke run.** Gates: strict manifest analyzer, `vue-tsc`, `lint:tokens/a11y`, React codegen + `tsc`, docs example parity + `nuxt build`. Behaviour: a scratchpad static demo driven by the raw-CDP recipe (memory `project_csc_ui_next_visual_verify`, `cdp-lib.mjs` pattern) covering the brief's test list for c-tree-select and the c-autocomplete regression surface (open/close/light dismiss/Escape/focus return/peek/external/multiple), light + dark. Results reported in the PR. A committed test harness (vitest browser mode) is a separate plan + ADR.
6. **No external / lazy mode in v1.** No `external`, `loading`, `change:path`. `change:query` stays (shared search-input contract, ADR-0029, informational). usage.md carries a "lazily loaded trees" TODO paragraph. Item model must remain extensible with a later lazy marker (e.g. `childCount?: number`) without breaking changes — so "leaf" is defined as "no `children` array or an empty one" today, and nothing else keys off array identity. Docs example "External / lazy" is dropped.
7. **Closed field shows two lines**: muted `text-xs` path line ("Natural sciences › Physics") above, then `code` (muted, tabular-nums) + label. Rendered as markup in `c-input`'s default slot next to the visually-clipped readonly `role="combobox"` input, whose `value` is the flattened "path › code label" string (AT + form `name`). The field is taller than sibling fields; accepted. `label-on-top` not forced.
8. **`allow-branch` commits via a pinned "select this level" row.** Branch rows always descend (click / Enter / ArrowRight). Inside a branch (depth ≥ 1) and only with `allow-branch`, the level list starts with a pinned sticky row labelled `texts.select(name)` ("Select Natural sciences"); it reuses the select-all row machinery (ADR-0046: `data-*` marker excluded from the peek rows, arrow keys reach it, Enter commits, sticky with the list's top padding dropped while shown). Every row has one action, so Enter is mode-independent. In search results with `allow-branch`, matching branches are listed and commit directly. Without `allow-branch`, branches never appear as results.
9. **`return-object` emits a fresh object without children** (precedent: c-autocomplete emits `{ name, value }`, never the item reference): `{ value, name, code?, path }` where `path` is the ancestor chain root-first, each `{ value, name, code? }`. Types: `CTreeSelectSelection`, `CTreeSelectValue = number | string | CTreeSelectSelection | null`.
10. **Vocabulary** (to CONTEXT.md, see bottom): **browse** / **search** modes, **level list**, **item** (data word, `CTreeSelectItem`), **branch** / **leaf**, **level** (1 = top), **path** (ancestor chain, root-first), **breadcrumb** of **crumbs** with a **root crumb** ("All"). Avoid: stepper, step, node, folder, tree view. Code identifiers follow: `level`, `path`, `crumb`, `isBranch`, `browseMode`/`searchMode`.
11. **Interactions**: keep the "Browse instead" control in the results `header` (mouse affordance, `@mousedown.prevent`, clears the query, returns to the remembered level) and Backspace-in-empty-query = go up one level (same as ArrowLeft). Arrow Left/Right act on levels only while the query is empty. **Not** carried over: open-on-focus (opens on click / ArrowDown / Enter like c-autocomplete) and clear-then-open (clear only clears, like c-autocomplete).
12. **Search scope is the whole tree, always.** Default matching: case-insensitive substring over `name` and `code` of the item and of every ancestor on its path (a query matching an ancestor lists all its leaves). Deviates knowingly from c-autocomplete's `startsWith` default (long multi-word taxonomy labels + codes). `filter?: (item, query, path) => boolean` replaces the default. Match marking (`<mark part="match">`) on label, code and path segments alike, via `splitMatches`.

## Settled by precedent (no question asked)

- **Panel header** (`part="header"`): browse mode shows `texts.choose(levelLabel)` where the level label is `levelLabels[level-1]` else `texts.level(level)`, plus `texts.step(n, total)` **only while the whole tree is evenly deep** (`total` = the tree's depth, constant while browsing); in an unevenly deep tree the counter is omitted and an all-leaf level shows `texts.final`. (Changed during implementation from "uniform below the current level": under that rule every all-leaf level was uniform, so `final` was unreachable and the total shifted as the user browsed.) Search mode shows `texts.matches(count)` + the "Browse instead" control.
- **Roles**: search input `role="combobox"` + `aria-activedescendant` + `aria-controls`; the level list / results list is a flat `role="listbox"` of `role="option"` rows (not `role="tree"`: one level is visible at a time, exactly a listbox). Breadcrumb is `<nav :aria-label="texts.breadcrumb">` of `<button type="button" tabindex="-1" @mousedown.prevent>` crumbs (mouse; keyboard = ArrowLeft/Backspace). Level changes and result counts go through the status announcer.
- **Disabled items**: a disabled branch is not enterable, a disabled leaf not committable; both render as disabled rows (`aria-disabled`), skipped by arrow navigation; search still lists them disabled.
- **Reopen**: at the committed item's parent level, committed row `aria-selected` + trailing check (c-select/c-autocomplete idiom), virtual highlight seeded on it. Empty value: root level, first enabled row highlighted. Query resets on open and `change:query` `''` fires (ADR-0029).
- **Close**: Escape → close + focus back to field; Tab → close, no focus return; outside pointerdown → close; commit → close + focus field.
- **Field props** as c-autocomplete: `label, labelOnTop, hint, errorMessage, valid, required, disabled, clearable, placeholder` (targets the search input, falls back to `texts.searchPlaceholder`), `size, shadow, hideDetails` (data channel), `hostId, name, itemsPerPage` (default 6; peek excludes the pinned select-branch row), `texts, value, returnObject, items, levelLabels, allowBranch, filter`. Attribute-supplied booleans (`allow-branch`, `hide-details`) resolved from the host attribute first.
- **Texts** (`CTreeSelectTexts`, all optional, merged by shallow spread): `root` "All", `breadcrumb` "Selected levels" (nav label), `level(n)` "Level {n}", `step(n, total)` "Step {n} of {total}", `matches(count)`, `children(count)` "{count} subfields" → generic "{count} options", `final` "Final level", `select(name)` "Select {name}", `browse` "Browse instead", `noResults` "No matching data", `searchPlaceholder` "Search...", `filterOptions` (search input aria-label), `clearSelection`, `toggleOptions`. No `loading` (no external mode).
- **Parts**: `panel, card, search, breadcrumb, crumb, header, list, item, select-branch, code, path, match, info`. All static `part="…"` with 1:1 `@csspart` tags.
- **Docs examples** (`packages/csc-ui-documentation/app/examples/c-tree-select/`): `basic` (3-level field-of-science tree with codes), `uneven-depth`, `allow-branch`, `custom-filter`, `small`, `i18n` (Finnish texts). Each with `.react.tsx`, `.angular.ts`, `.typescript.html` (+ `.typescript.ts` where the tree must be assigned as a property — every example here, since `items` is a property).
- **Changeset**: one new `.changeset/tree-select-component.md`, `minor` for both packages, house style of `progress-circle-component.md`; describes the new component only (the c-autocomplete refit is internal, no behaviour change).
- **Plan file** is copied to `_plan/tree-select-component.md` on exit from plan mode; the `_todo` brief stays (convention: `_todo/circular-progress-component.md` still exists for a shipped component).

## Implementation

Sibling mirrored throughout: `packages/csc-ui/src/components/c-autocomplete/CAutocomplete.vue` (line refs below are into it). Order of work: **A** (shared composables + c-autocomplete refit, build green) → **B** (component) → **C** (plumbing, docs, changeset, glossary/ADR) → **D** (verification).

### A. Shared composables + c-autocomplete refit

Nothing in the extracted blocks reads `multipleOn`; the manifest, tag map and React wrappers are unchanged by this step (no new parts/slots/events/props). Shared-helper conventions to follow: module docblock citing CONTEXT.md terms + ADR numbers, exported `XxxOptions` / handle interfaces with one-line JSDoc per member, perfectionist alphabetical ordering (see `src/shared/useDesignatedTrigger.ts`, `peekCap.ts`).

**`packages/csc-ui/src/shared/useAnchoredPanel.ts`** (new) — a straight move of `CAutocomplete.vue` :803–815 (`messageOffset`, `panelStyle`), :1259–1318 (`openPanel`/`closePanel`/`onToggle` minus the component-specific lines), :1603–1615 (light dismiss), :1698–1701 (unmount `hidePopover`).

```ts
export const FIELD_PANEL_ANCHOR = '--c-field-panel-anchor'; // tree-scoped: one name serves every consumer's shadow root

export interface UseAnchoredPanelOptions {
  anchor: Readonly<Ref<HTMLElement | null>>;          // shadow-DOM wrapper; carries anchor-name, its rect pins the width
  disabled?: () => boolean;                           // open() is a no-op while true
  field: Readonly<Ref<HTMLElement | null>>;           // the inner c-input host; its [part='message'] height is pulled back
  host: HTMLElement | null;                           // light dismiss keeps pointerdowns whose composedPath includes it
  onClosed?: () => void;                              // runs inside the native toggle handler, before focus returns
  onOpened?: () => void;                              // runs inside the native toggle handler after polyfill + dismiss listener
  panel: Readonly<Ref<HTMLElement | null>>;           // the popover="manual" element
  returnFocusTo: MaybeRefOrGetter<HTMLElement | null | undefined>;
}
export interface AnchoredPanel {
  anchorStyle: string;                                // `anchor-name:--c-field-panel-anchor`
  close(returnFocus?: boolean): void;
  isOpen: Readonly<Ref<boolean>>;                     // written only by the native toggle event
  onToggle(event: Event): void;                       // bind as the panel's @toggle
  open(): void;                                       // measure anchor width + message height, then showPopover()
  panelStyle: ComputedRef<string>;                    // position-anchor; position-area:bottom span-right; inset:auto; width; -margin-top
}
```
Hooks, not a watcher: `onOpened`/`onClosed` run synchronously at the exact positions of today's inline code so `change:query` still fires within the toggle event (a `watch(isOpen)` would defer it — a behaviour change). The composable registers its own `onBeforeUnmount` (remove the document listener, `hidePopover()` if open). The `@position-try` CSS stays **per SFC** (each element type has its own adopted sheet, `src/shared/defineElement.ts`), renamed to shared names `--c-field-panel-above` / `--c-field-panel-above-left` so the two blocks are copy-identical; ADR-0007 header comment gains one line naming the composable.

**`packages/csc-ui/src/shared/useStatusAnnouncer.ts`** (new) — the debounce from :1526–1553.

```ts
export interface StatusAnnouncer {
  announce(compose: () => string): void;   // compose runs when the 1400 ms debounce fires (reads state current *then*); every call restarts the timer
  cancel(): void;                           // also runs on unmount
  set(text: string): void;                  // immediate write — the seam for c-dropdown's setStatusText later
  text: Readonly<Ref<string>>;              // bind as the aria-live="polite" aria-atomic="true" region's content
}
export const useStatusAnnouncer = ({ delay = 1400 } = {}): StatusAnnouncer
```
The region itself stays a 7-line template snippet per component (a shared SFC would add an analyzer-scanned import and a child instance for no contract gain). c-dropdown / c-select keep their copies (out of scope; `set()` is their future seam).

**Refit of `CAutocomplete.vue`**
- Template: anchor span `style="anchor-name: --c-autocomplete-anchor"` → `:style="anchorStyle"` (update the :2–5 comment). Panel div (`:style="panelStyle" @toggle="onToggle"`) and status div (`{{ statusText }}`) unchanged — destructure under the same names.
- Imports: drop `ensureAnchorPositioning`; add `useAnchoredPanel`, `useStatusAnnouncer`. Keep `onBeforeUnmount` (observer disconnect).
- Remove :742 `isOpen`, :751 `statusText`, :753 `panelWidth`, :763 `pendingReturnFocus`, :803–815, :1528 `statusDebounce`, :1601–1615.
- Replace :1257–1318 with `const { anchorStyle, close: closePanel, isOpen, onToggle, open: openPanel, panelStyle } = useAnchoredPanel({ anchor: anchorRef, disabled: () => props.disabled, field: cInputRef, host, onClosed: () => { activeIndex.value = -1 }, onOpened: () => { query.value = ''; emit('change:query', ''); requestAnimationFrame(() => { applyListCap(); searchRef.value?.focus(); seedActiveIndex(); updateStatusText(); }); }, panel: panelRef, returnFocusTo: fieldRef })`. Renaming in the destructure leaves every call site untouched.
- Replace :1526–1553 with `const { announce: announceStatus, text: statusText } = useStatusAnnouncer();` and `updateStatusText = () => announceStatus(() => { …same compose body… })`.
- Replace :1692–1704 with `onBeforeUnmount(() => { childObserver?.disconnect(); })` (drop the `void cInputRef.value;` hack).
- Style: rename the two `@position-try` rules + `position-try-fallbacks` list; nothing outside the SFC references the old names.

**Step order (build green after each)**: (1) add both `.ts` files, `pnpm --filter @cscfi/csc-ui build` + eslint on them; (2) refit the announcer, build, check the docs `basic` example announces after 1.4 s; (3) refit the panel (template line, imports, deletions, composable call, trimmed unmount), build, `lint:a11y`, `lint:tokens`; (4) rename the try rules + comments, build; (5) ADR-0009 amendment note. Commit `Refactor(c-autocomplete): Extract useAnchoredPanel and useStatusAnnouncer` (`Refactor(` has precedent in history) — no changeset text of its own (internal; the component's minor changeset covers the PR).

**Risks**: `isOpen` is used textually above the composable call (safe: all uses are inside computeds/handlers; or place the call at :742). `anchorStyle` becomes a string binding — identical computed style on native browsers; Firefox polyfill path is a baseline comparison (fallback: keep a static `style` literal). `returnFocusTo` typing (`ShallowRef<HTMLInputElement|null>` → `MaybeRefOrGetter<HTMLElement|null|undefined>`) — if vue-tsc objects, pass `() => fieldRef.value`. Coupling to `c-input`'s `message` part is public `::part` API; a future non-c-input consumer gets an optional `blockEndOffset?: () => number` instead of a widened `field`.

### B. `packages/csc-ui/src/components/c-tree-select/CTreeSelect.vue` + `usage.md`

**State model**
- `index = computed(() => buildIndex(props.items))`: one preorder DFS per `items` assignment → `{ byValue: Map<value, Entry>, flat: Entry[], rootLeafDepth }`, `Entry = { item, path: CTreeSelectItem[], depth, isBranch, disabled (own || ancestor), terms: string[] (lowercased name+code of item and every ancestor), leafDepth: number | null }`. `leafDepth` bottom-up: leaf 0; branch = children all equal non-null → +1, else null (drives the step counter).
- Level position is **`pathValues: (number|string)[]`** (ancestor values root-first), not item refs: consumers re-assign `items`; values are unique by contract. `path = computed` = longest valid prefix re-resolved against `byValue` (self-clamping when an ancestor vanishes); navigation writes back the normalized values. `currentBranch = path.at(-1) ?? null`, `depth = path.length`, `levelItems = currentBranch?.children ?? props.items ?? []`.
- `query` with single write path `setQuery()` (:735–740, emits `change:query` only on change); `mode = query ? 'search' : 'browse'`. Browse position survives a search untouched.
- `results` (search): `index.flat.filter(e => (allowBranchOn || !e.isBranch) && filterFn(e.item, q, e.path))`; default `filterFn` = `terms.some(t => t.includes(q))`. `rows` = level entries or results; `renderedRows` adds `splitMatches` segments for name / code / path (a `computed`, never a template method — :973–978).
- `activeIndex` with sentinel `SELECT_BRANCH_ROW = -2` (:749 pattern). `activeDescendantId` (:929–935).
- Header: `texts.choose(levelLabel(depth + 1))`; `stepText` = `texts.step(depth + 1, depth + remaining)` when `remaining = currentBranch ? entry.leafDepth : rootLeafDepth` is non-null, else `texts.final` when every row is a leaf, else nothing. `levelLabel(d) = levelLabels?.[d-1] ?? texts.level(d)`.
- Committed: `committedValue = valueOf(value)` (:993–994); `committedEntry = byValue.get(...)`; `committedSelection` remembered at commit (:1032–1034). Display chain (:1040–1056): index entry → remembered → the object value's own `name/code/path` → `String(value)`. `inputValue` = `"path names › code name"`.
- Booleans: `allowBranchOn`, `hideDetailsResolved` from host attribute first (:781–793); others via `coerceBoolean`.

**Keyboard** (search input has focus; field keys mirror :1365–1408: ArrowDown/Up/Enter/Space open, click/chevron toggle, clear = `onReset` :1233–1246)

| Key | browse (query empty) | search |
|---|---|---|
| ArrowDown/Up | `moveActive(±1)` over enabled rows, select-branch sentinel first in cycle (:1413–1433) | same over results |
| Home/End | select-branch if shown else first / last enabled | first / last |
| Enter | `activateRow(active)` | same |
| ArrowRight | enabled branch → `preventDefault; descend(item)` | caret |
| ArrowLeft | `depth > 0` → `preventDefault; goUp()` | caret |
| Backspace | `depth > 0` → `preventDefault; goUp()` | native edit; `onSearchInput` re-seeds (:1435–1444) |
| Escape / Tab | `close(true)` / `close(false)` | same |

`activateRow`: select-branch → `commit(currentBranch, path.slice(0,-1)); close(true)`; disabled → nothing; branch in browse → `descend`; otherwise `commit(item, path); close(true)`. `commit` (:1204–1214) builds `next = returnObject ? { value, name, code?, path: [...] } : item.value`, sets local value, remembers, `emitModelChange(host, next)`. `descend`: push, rAF → first enabled + `scrollTop = 0` + announce. `goUp`: pop, highlight the branch just left. Crumb → `goToDepth(i)`; "Browse instead" → `setQuery('')` + clear the input. Rows/crumbs/browse button: `tabindex="-1"` + `@mousedown.prevent` (:245–247); rows `@pointermove` set `activeIndex`.

**Template** (two roots ⇒ `defineOptions({ inheritAttrs: false })`)
- Root 1: anchor `<span>` → `<c-input :active :data-hide-details :disabled :error-message :filled :hint :input-id :label :label-on-top :required :shadow :size :valid @click>` (:11–27) containing: clipped readonly `<input role="combobox" aria-haspopup="listbox" :aria-controls :aria-expanded :aria-label :name :value="inputValue">`, the two-line value block (`aria-hidden`: path line, then `<span part="code">` + name), clear `c-icon-button` (`mdiClose`) or chevron `c-icon-button` (`mdiChevronDown`, rotate variant) (:88–112).
- Root 2: `<div part="panel" popover="manual" :style="panelStyle" @toggle>` → `<div part="card">` → status region → `<div part="search">` (`mdiMagnify` svg + `<input role="combobox" aria-autocomplete="list" :aria-activedescendant :aria-controls :aria-label="t.filterOptions" :placeholder="placeholder || t.searchPlaceholder">`) → `<nav part="breadcrumb" :aria-label="t.breadcrumb">` of `<button part="crumb" type="button" tabindex="-1" :aria-current="last ? 'location' : undefined" :disabled="last">` with `›` separators (root crumb first; > 4 crumbs collapse the middle into one `…` crumb with a `title`, still `part="crumb"` statically) → `<div part="header">` (browse: choose + step; search: `t.matches(n)` + browse button) → `<ul part="list" role="listbox" tabindex="-1" :id>` with: pinned `<li part="select-branch" role="option" data-select-branch :id="${id}-select-branch">` (sticky recipe :631–636, list `pt-0` while shown), `<li part="info">` when no rows (`mdiAlert` + `t.noResults`), and `<li part="item" role="option" :id="${id}-opt-${i}" :aria-disabled :aria-selected="row.item.value === committedValue" :data-active>` rows: `part="code"` (segments), label (segments), `part="path"` in search mode (segments, `›`-joined, `text-xs truncate`, row `title` = full path), branch meta `t.children(n)` + `mdiChevronRight` in browse mode, trailing `mdiCheck` when selected (one gate for `aria-selected` and the check, commit d54ae8a9).
- Peek: `applyPeekCap(list, { ceiling: cardMax - (list.top - card.top), itemsPerPage, rows: 'li[role="option"]:not([data-select-branch])' })` (:823–844); breadcrumb + header are inside the ceiling subtraction.
- `tv()` slots (parts in brackets): `panel[panel] card[card] content input fieldText fieldPath fieldMain iconButton chevron search[search] searchIcon searchInput breadcrumb[breadcrumb] crumb[crumb] crumbSep header[header] headerAction list[list] item[item] itemMain itemLabel code[code] path[path] meta check info[info] infoIcon visuallyHidden`; variants `chevronActive`, `disabled`, `selectBranch`. Muted text = `text-on-surface-muted` (`src/styles/css/tailwind-theme.css:33`), links `text-link`, selected `text-primary`; **no new tokens**. Escape-hatch `<style>`: `:host{display:block;cursor:text}`, `[part='match']` underline (:1784–1790), placeholder rule, and the position-try block unless A owns it — each rule justified per ADR-0007.

**Watchers / hazards**
- `watch(() => props.value)` mirrors only, never emits (`emitModelChange` writes `host.value` and re-enters it).
- `useAnchoredPanel` hooks (not a watcher): `onOpened` → `query=''`, clear input, `emit('change:query','')` unconditionally (:1299–1300), `pathValues = committedEntry?.path values ?? []`, rAF → cap, focus search, seed highlight, announce; `onClosed` → `activeIndex = -1`.
- `watch([rows, itemsPerPage])` → cancel + rAF `applyListCap()` (:1558–1568; post-flush watchers measure stale DOM in custom elements).
- `watch(index)` (items reassigned while open): path self-clamps; re-home highlight (:1573–1592), re-announce.
- `watch(path)`: re-seed highlight, `scrollTop = 0`, rAF cap, announce choose + step. `watch(activeIndex)` announces entering/leaving the select-branch row.
- `onBeforeUnmount`: `hidePopover` if open; announcer timers cleared by the composable.

**Public types** (plain `<script lang="ts">`; all six re-exported from `src/index.ts`, hard analyzer error otherwise): `CTreeSelectFilter`, `CTreeSelectItem` (`value`, `name`, `code?`, `disabled?`, `children?`), `CTreeSelectSelection` (`value`, `name`, `code?`, `path: Array<{ value; name; code? }>`), `CTreeSelectValue`, `CTreeSelectTexts` (`breadcrumb, browse, children(n), choose(levelLabel), clearSelection, filterOptions, final, level(n), matches(n), noResults, root, searchPlaceholder, select(name), step(n,total), toggleOptions`), `CTreeSelectProps` (every bare-string prop tagged `@freeform`; `items`, `levelLabels`, `texts`, `filter` documented as property-only). Event map `interface CTreeSelectEvents { change: CTreeSelectValue; 'change:query': string; input: void; 'update:value': CTreeSelectValue }` (precedent `CButtonGroup.vue:96–113`). Docblock: `@csspart` × 13, no `@slot`, no prose.

**`usage.md`**: first paragraph = "A hierarchical value-selection component: a readonly value field that opens a panel for browsing a tree level by level, or searching it as a whole, to commit one item." Sections: Items · Browsing and searching · Committing a branch · Texts · Scrolling (copy of c-autocomplete's :144–157 with `c-tree-select::part(list)`) · Lazily loaded trees (TODO: no `loading`/per-branch fetch; today re-assign `items` with `children` filled in — the panel keeps its level).

**Edge cases settled**: duplicate values → first wins in the index, commit uses the clicked row's own path; documented "values must be unique", no runtime warning. Empty `items` → `info` row, panel still opens. `value` on a branch without `allow-branch` → displayed, reopen at parent with the row selected+checked, Enter descends. `value` not in the tree → display chain fallback, reopen at root. Descendants of a disabled branch → listed disabled in results. `size="small"` two-line value → the box grows like the default; accepted. Crumb overflow → collapse middle crumbs beyond 4. Long result path → end-ellipsis + row `title`.

### C. Plumbing, docs, release, documentation

1. `packages/csc-ui/src/index.ts`: alphabetical import; `export type { CTreeSelectFilter, CTreeSelectItem, CTreeSelectProps, CTreeSelectSelection, CTreeSelectTexts, CTreeSelectValue }`; `['c-tree-select', CTreeSelect]` after `['c-autocomplete', CAutocomplete]` (shadow uses `c-input`, `c-icon-button`, `c-icon`, all registered earlier); append to `tailwindVariantTags`.
2. `pnpm --filter @cscfi/csc-ui docs:manifest` → commit regenerated `src/tag-name-map.ts`; `pnpm --filter @cscfi/csc-ui-react build` → commit regenerated `src/components.ts` (`CTreeSelect` with `onChange`, `onChangeQuery`, `onInput`, `onUpdateValue`).
3. Docs examples `packages/csc-ui-documentation/app/examples/c-tree-select/`: `basic` (field-of-science, 3 uniform levels, codes = values, `clearable`, `level-labels`, hint), `uneven-depth` (org tree depth 1–3, one disabled branch + one disabled leaf, step counter omitted / `final`), `allow-branch`, `custom-filter` (e.g. code-prefix filter), `return-object` (prints the selection JSON), `texts` (Finnish texts + Finnish level labels), `small` (`size="small"` + `label-on-top`). Each with `.react.tsx`, `.angular.ts`, `.typescript.html` + `.typescript.ts` (items are properties). Canon `.vue` files import everything explicitly (parity script).
4. `.changeset/tree-select-component.md`: both packages `minor`, `Feat(c-tree-select): …` house style (`progress-circle-component.md`).
5. `CONTEXT.md` + `docs/adr/0047-…` + ADR-0009 amendment note (drafts below).
6. Copy this plan to `_plan/tree-select-component.md`.

## Verification

**Outcome (2026-09-11):** all gates green (strict analyzer 0 errors, `vue-tsc`, `lint:a11y`, `lint:tokens`, React codegen, docs example parity + `nuxt build`). Smoke run: **132 checks passed, 0 failed** in light + dark (scratchpad `smoke.mjs`, `demo.html`, `cdp.mjs`). Two field bugs found after the first pass and fixed: the empty field's chevron sat under the label because the value block was `v-if`'d away (the block is now always rendered as the row's filler), and an empty `v-model` floated the label and showed the clear button because Vue's `vModelText` writes `el.value = ''` for a `null` model (the empty string now normalizes to `null` in `valueOf`, as `!!value` does in the siblings). One real bug found and fixed in both components: a click on a disabled row (`pointer-events: none`) fell through to the `<ul tabindex="-1">`, which took DOM focus from the search input — fixed with `@mousedown.prevent` on the list. Observed, not changed: c-autocomplete's in-panel search input has no explicit `role="combobox"` (implicit textbox), unlike the glossary's description; c-tree-select mirrors it.

**Gates (must all pass)**
```bash
pnpm --filter @cscfi/csc-ui build            # tokens → chart → tag map → vite → vue-tsc → docs:manifest:strict
pnpm --filter @cscfi/csc-ui lint:tokens -- --strict
pnpm --filter @cscfi/csc-ui lint:a11y
pnpm --filter @cscfi/csc-ui-react build      # regenerate wrappers + tsc
pnpm --filter @cscfi/csc-ui-documentation build   # example parity + nuxt build
git status --porcelain packages/csc-ui/src/tag-name-map.ts packages/csc-ui-react/src/components.ts  # regenerated files committed
```
After step A alone: `dist/custom-elements.json` and `src/tag-name-map.ts` must be byte-identical to before (no drift).

**Scripted CDP smoke run** (scratchpad only, not committed; static demo over HTTP + raw-CDP driver per memory `project_csc_ui_next_visual_verify`; window ≥ 1000 px wide; spawn chrome with `cwd` in the scratchpad and `ulimit -c 0`; real keys via `Input.dispatchKeyEvent`, punctuation via `Input.insertText`; light + dark via `Emulation.setEmulatedMedia`).

c-tree-select:
1. Open on field click / ArrowDown / Enter / Space; not on bare focus. Panel width = field width; flush under the field with hint, with error message, with `hide-details`; flips above near the viewport bottom.
2. Browse: root level lists top items with `code`, child count and chevron; click a branch → its children, breadcrumb gains a crumb, header "Choose {level-labels[1]}" + "Step 2 of 3"; click a leaf → `change` (detail = value), `update:value`, `input` fire, panel closes, focus on the field, closed field shows path line + code + label.
3. Crumb click and root crumb jump to that level; ArrowLeft and Backspace-in-empty-query go up one level; ArrowRight on a highlighted branch descends; Home/End.
4. Reopen after commit: parent level, committed row `aria-selected` + check, highlight seeded on it. Reopen with `return-object`: same, and the emitted object is `{ value, name, code, path[] }` without `children`.
5. Search: typing lists matches from the whole tree with `part="path"` lines and `<mark part="match">` in label/code/path; ancestor match lists all its leaves; header "N matches"; "Browse instead" and deleting the query return to the remembered level; `change:query` fires per keystroke and `''` on open; no-results row; custom `filter` replaces the default.
6. `allow-branch`: pinned select-branch row at level ≥ 1 (sticky, excluded from the peek rows, Home lands on it), Enter/click commits the branch; matching branches appear as results; without the prop no branch is listed in results and Enter on a branch descends.
7. Disabled branch not enterable, disabled leaf not committable, arrows skip both; descendants of a disabled branch listed disabled in results.
8. Clear button resets to `null` (events fire), panel stays closed. Escape closes with focus return; Tab closes without; outside pointerdown closes; `items` re-assigned while open keeps the level and re-homes the highlight.
9. Peek: overflowing level list ends on a half row at `items-per-page` (default 6) and re-caps on level change / query change; `size="small"`; uneven tree omits the step counter and shows "Final level" on an all-leaf level.
10. Live region text after 1.4 s on open, level change, result count.

c-autocomplete regression (all six docs examples as static demos): open paths (click, chevron, Space/Enter/ArrowDown/ArrowUp, printable key seeds the query); close with focus return (Escape, chevron Enter/Space, single-mode pick) vs without (Tab, field/chevron click while open, outside pointerdown including another element's shadow content); chevron rotation / `c-input :active` / `aria-expanded`; geometry (width, flush with hint / error / hide-details, re-measured per open) and flip (above, above-left); Firefox polyfill placement vs the pre-refactor baseline build (`git show HEAD:…` swap, not stash); `external` + `loading` (`change:query ''` synchronous within toggle, loading row, highlight re-home, label survives an items swap); `multiple` (row toggle keeps focus in search, tag ×, Backspace on closed field, `max-tags`, select-all row Home/announce/Enter); peek re-cap on filter and `items-per-page` change; teardown (no orphaned top-layer panel, no document `pointerdown` listener, no timer into an unmounted component).

Report the check counts and any failure verbatim in the PR description.

## Documentation updates to apply on exit from plan mode

### `CONTEXT.md` — new subsection `### Tree select` (after `### Menu`, before `### Overlays`)

```md
### Tree select

**Tree select** (`c-tree-select`):
A single-value **value-selection** field for nested **items** of arbitrary depth, presented as a **stepped listbox**: its panel shows one **level** at a time with a **breadcrumb** for climbing back, and a whole-tree **search** while a **query** is typed (ADR-0047). Shares the **autocomplete**'s arrangement (readonly **value field**, in-panel **search input**) and emits the 4.x value events (`change` with the value, `update:value`, `input` — no grandfathered `changeValue`). Takes its data from the `items` property only.
_Avoid_: Tree view (a different pattern — expand/collapse in place, `role="tree"`), tree picker, cascader, nested select, hierarchical dropdown

**Stepped listbox**:
The arrangement in which a hierarchy is browsed one flat `role="listbox"` **level** at a time — activating a **branch** replaces the list with its children, the **breadcrumb** climbs back — rather than expanding items in place. `c-tree-select`'s panel arrangement (ADR-0047).
_Avoid_: Stepper (a form-wizard pattern), drill-down, miller / cascading columns (several levels visible at once)

**Branch** / **Leaf** (tree select):
The two kinds of **item** in a tree: a branch has children and descends when activated in **browse** mode; a leaf has none and commits when activated. A branch can be committed only under `allow-branch`, via the **select-branch row**. "Leaf" means no `children` array or an empty one.
_Avoid_: Node (the DOM sense everywhere else in this codebase), folder, parent/child as kinds (those are relations), category

**Level** (tree select):
The depth of an **item** in the tree, counted from 1 at the top. The **level list** is the panel's list of one level's items in **browse** mode. A consumer may name levels (`level-labels` — "Primary field", "Secondary field"); the names appear in the panel header and on crumbs.
_Avoid_: Depth (zero-based implementation word), tier, step, layer

**Path** (tree select):
An **item**'s chain of ancestors, root-first. Shown under each search result and above the label in the closed **value field**; carried on the emitted selection under `return-object`. Distinct from the **query**.
_Avoid_: Ancestry, trail, hierarchy, parents

**Breadcrumb** / **Crumb** (tree select):
The row of **crumbs** at the top of the panel naming the current **path** — a **root crumb** ("All") followed by one crumb per ancestor — each of which climbs back to that **level**. A navigation aid inside the panel; there is no page-level breadcrumb component.
_Avoid_: Back button (there is none), path bar, trail

**Browse** / **Search** (modes, tree select):
The two panel modes: **browse** while the **query** is empty (the **level list** under the **breadcrumb**), **search** while a query is typed (a flat list of matches from the whole tree, each with its **path**). Clearing the query returns to the remembered level.
_Avoid_: Stepper mode, navigate, filter mode (the query narrows nothing in browse mode)

**Select-branch row** (tree select):
The pinned first row of a **level list** inside a **branch**, present only under `allow-branch`, that commits the branch itself ("Select Natural sciences"). Like the **select-all row** it carries no value of its own and is not an item; it is the only way to commit a branch while browsing.
_Avoid_: Select affordance, "select this level" button, row action
```

Also extend **Flagged ambiguities** with:

```md
- **"Path"** is overloaded: (a) an SVG path datum (`c-icon`'s `path` prop), (b) a tree-select item's ancestor chain (see **Path**), (c) a URL or file path. Say **"icon path"** for (a), plain **"path"** only in the tree-select sense, and **"URL"/"file path"** for (c).
```

And amend the **Autocomplete** entry's parenthetical so it reads "(`c-autocomplete` and `c-tree-select` are also value-selection but do **not** sit on `c-dropdown` …)" in the **Dropdown** entry; add `c-tree-select` to the **Top layer** list of native popovers ("the menu family, autocomplete and tree-select panels, …") and to **Peek** ("`c-autocomplete`'s options list, `c-tree-select`'s level and results lists").

### `docs/adr/0047-c-tree-select-is-a-stepped-listbox-not-a-tree-view.md`

```md
# 47. c-tree-select is a stepped listbox, not a tree view

Date: 2026-09-11

## Status

Accepted

## Context

CSC forms need a field for picking one item from nested classification data
of arbitrary depth (field-of-science taxonomies with codes, three or more
levels, hundreds of leaves). Neither `c-select` nor `c-autocomplete` can
express hierarchy. The obvious shape for hierarchical data is a tree view
(`role="tree"`, expand/collapse in place); the validated prototype instead
browsed one level at a time and searched across the whole tree.

## Decision

`c-tree-select` presents the hierarchy as a **stepped listbox**: the panel
shows one level as a flat `role="listbox"`, activating a branch replaces the
list with its children, a breadcrumb climbs back, and typing switches to a
whole-tree search whose results carry their path. It reuses c-autocomplete's
field arrangement (readonly value field, in-panel search input, virtual
highlight via `aria-activedescendant` — ADR-0009) through shared composables
extracted from it. Data comes from the `items` property only. A branch is
committed (with `allow-branch`) through a pinned select-branch row inside it,
not through a second action on its own row. Value events follow ADR-0017
(`change` + `update:value` + `input`; no grandfathered `changeValue`).

## Alternatives considered

- **Tree view** (`role="tree"`, expandable rows): several levels visible at
  once, but a taxonomy hundreds of leaves wide overflows a transient panel,
  keyboard needs the full treeitem grammar, and search results still need a
  flat list — two structures in one panel.
- **Cascading columns** (several levels side by side): needs horizontal room
  a form field's panel does not have.
- **Nested `<c-option>` authoring**: both existing parents discover options
  with a descendant query and snapshot `outerHTML`; nesting would need a new
  recursive discovery helper and two render paths (data vs. snapshot). Left
  as a possible additive extension.
- **A row-level "Select" action on branches**: a nested interactive inside a
  `role="option"` is unreachable by the virtual highlight and makes Enter's
  meaning depend on `allow-branch`; the pinned row keeps every row
  single-action.

## Consequences

- One a11y model shared with c-autocomplete (editable combobox over a
  listbox); no `role="tree"` anywhere in the library.
- Committing a branch costs one extra step (descend, then the pinned row).
- Lazy loading is deferred: "leaf" means "no `children` array or an empty
  one"; a lazy marker (e.g. `childCount`) can be added without breaking the
  item shape. No `external` mode, no `change:path` event in 4.x-alpha.
- The popover-panel lifecycle and the status announcer become shared
  composables, amending ADR-0009's accepted duplication.
```

### `docs/adr/0009-c-autocomplete-on-popover-not-c-dropdown.md` — amendment note

Append to the last consequence bullet ("Some positioning/empty-state logic is duplicated rather than shared. Accepted…"):

> *(Amended 2026-09-11: the anchored-panel lifecycle — shadow-root anchor, manual popover open/close, `toggle`-driven state, light dismiss, focus return — and the debounced live status region are now the shared `useAnchoredPanel()` / `useStatusAnnouncer()` composables in `src/shared/`, extracted ahead of `c-tree-select` (ADR-0047), which builds on the same field-plus-panel arrangement. What stays duplicated per component is the few lines of per-shadow-root `@position-try` CSS and the empty-state rows.)*

### Brief corrections carried into the deliverables

- Deliverable 3 "Vue, React and Angular wrapper entries": only the generated React wrapper exists; nothing to hand-edit. Angular/Vue/TS use the element natively (docs flavors show that).
- Deliverable 5 "tests": no harness exists → scripted CDP smoke run (decision 5).
- Deliverable 6 "Changelog entry": a changeset (ADR-0028); the changelog is generated.
- Events: `emitModelChange` set (decision 2), not the grandfathered triple.
- Parts: `select-branch` added; no `exportparts` (decision 3). "Query runs get the `match` part" = **match marking**; `items-per-page` half-row = **peek**.
