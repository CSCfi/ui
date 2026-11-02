# D13 "Before rc.1": verification

Scope: `_plan/csc-ui-4-stable-release.md` lines 119–141, split into 35 items. Each was checked against the SFC source, `api.snapshot.json`, `src/index.ts`, `src/types.ts`, the token sources, CONTEXT.md, the ADRs, usage.md files, the docs canons and the migration guide. 3.x names were checked with `git grep … origin/legacy-main`. MyCSC is unknown for every item (no checkout).

Counts: **22 CONFIRMED · 1 ALREADY-COVERED · 1 WRONG-BUCKET · 1 CONTRADICTS-DOCS · 10 NEEDS-CALL**

| # | Item | Verdict | One-line reason |
|---|------|---------|-----------------|
| 1 | Remove `--c-ring` / `ring` token | CONFIRMED | No SFC uses it; the only consumer is `tailwind-theme.css:40`. Also update the CONTEXT Semantic token list and the "Ring" ambiguity (a), ADR-0010/0018 mentions, `customization.ts:597-602` (its dark value `accent-400` is already stale; dark.json:18 says `primary-300`) and `audit-contrast.mjs:196`. |
| 2 | Remove `--c-text-*` / `--c-transparent` | CONFIRMED | 3.x tokens (legacy `tokens/theme/base.json`), now in the palette block, not mode-aware. Removal also needs: move `CPagination.vue:233,235` and `CNavigationButton.vue:26` from `text-[var(--c-text-system)]` to `on-surface-muted` (a dark-mode visual fix), delete `src/tailwind.css:144`, and add a migration line next to the `--c-font-family` one (`migration.ts:364`). MyCSC unknown. |
| 3 | c-icon: drop `--c-icon-color` | NEEDS-CALL | c-list-item relies on it (`CListItem.vue:302-309`), and `::part(root)` cannot recolour a `color`-set icon. Rename it to `--_c-icon-color`; don't drop it. |
| 4 | c-modal keeps `dismissable`; fix the file-upload "dismissible" | ALREADY-COVERED | CONTEXT.md:269 already says "closeable row" (be413bd8). c-modal needs no change. |
| 5 | Rename `mobile` / `mobile-breakpoint` (side-nav, c-tabs) to state names | WRONG-BUCKET | Both are 3.x names. Side-nav `mobile` is in wide use and has an additive path. Renaming only c-tabs splits it from c-table/c-login-card `mobile-breakpoint`. The glossary grandfathers these names, and the plan gives no target. |
| 6 | Correct the glossary's grandfathered list | CONFIRMED | True: c-steps has no such prop, and side-nav `mobile` is a plain prop (`CSideNavigation.vue:164`, no observer). Also add c-tabs, which does measure itself (`CTabs.vue:591`). |
| 7 | c-accordion-item `collapsable` → internal | CONFIRMED | Overwritten on every valued item (`CAccordion.vue:152-153`). It is a 3.x name, but meaningless inside an accordion. Note that value-less items are skipped (`:150`). |
| 8 | c-accordion-item `outlined` → internal | CONFIRMED | Pushed down from the parent's `outlined` (`CAccordion.vue:154`). The parent prop stays (ADR-0058). |
| 9 | c-accordion-item `expanded` → internal | CONTRADICTS-DOCS | The custom-style canon (all four flavours) styles `c-accordion-item[expanded]`, and CONTEXT.md:698 says "Anything a consumer is meant to use is never internal". It needs `:state(expanded)` first. |
| 10 | c-list-item-title `active` → internal | CONFIRMED | Overwritten by `CListItem.vue:199`. A 3.x name but parent-driven there too. No canon uses it. |
| 11 | c-data-table `change:selected` detail | NEEDS-CALL | "The `selected` value" (`string[]`) and "with a named type" point to different fixes. Dropping `rows` loses data unless a `selectedRows` getter replaces it. |
| 12 | c-data-table `filter` rename | NEEDS-CALL | The claim is true (`CDataTable.vue:417` string vs the predicate on c-autocomplete/c-tree-select), but the plan names no target. Recommend `query`, and widen the CONTEXT **Query** entry. |
| 13 | c-tooltip `content` slot → default slot | NEEDS-CALL | Whitespace text nodes fill a default slot and hide its `{{ text }}` fallback (checked in Chromium), so the TS canon would render an empty bubble. ADR-0033 names the `content` slot. |
| 14 | c-menu-item `icon` prop → `icon` slot | NEEDS-CALL | Alpha-only and the claim is true, but `active-icon` (the same icon-path pattern) and the `icon` part are left undecided. |
| 15 | c-menu-item `active` two-state + switch | NEEDS-CALL | The switch has no name or type. Hidden change: today's `active="false"` radio items silently become plain `menuitem`s without `aria-checked`. |
| 16 | c-login-button part `title` → `label` | CONFIRMED | `CLoginButton.vue:9`. Parts are 4.x-only. Matches c-breadcrumb-item's `label`, and the glossary's Avoid list includes "Title". Target from the audit. |
| 17 | c-menu-item part `submenu` → `submenu-list` | CONFIRMED | `CMenuItem.vue:51`. Pairs with `submenu-panel`, like c-menu `panel`/`list`. Update `c-menu/usage.md:12` and `c-menu-item/usage.md:7`. |
| 18 | c-side-navigation-title part `label` → `heading` | CONFIRMED | `CSideNavigationTitle.vue:3`. Glossary **Heading**. Siblings c-card-title, c-popover and c-alert use `heading`. |
| 19 | c-time-picker part `end-tab` → `end` | CONFIRMED | `CTimePicker.vue:81`. Glossary **End switch** avoids "Tabs". Mirrors `notation-switch`/`notation` (`CColorPicker.vue:262,270`). |
| 20 | List-row part: `item` vs `option` | NEEDS-CALL | The plan doesn't say which name wins. Recommend `option`: every row is `role="option"`, and the glossary reserves "item" for `items` entries. |
| 21 | c-tree-select texts `select` → `selectBranch` | CONFIRMED | `CTreeSelect.vue:609`. Matches the `select-branch` part, the **Select-branch row** term and the sibling `selectAll`. Update the four texts canons. |
| 22 | c-tree-select texts `step` → ? | NEEDS-CALL | No target. Glossary **Level** avoids "step". Recommend `levelCounter`, and fix the "Step 2 of 3" prose in `usage.md:51`. |
| 23 | c-number-field texts `increase`/`decrease` → `stepUp`/`stepDown` | CONFIRMED | `CNumberField.vue:255-258` vs parts `step-up`/`step-down`. Sibling keys mirror their parts (`nextMonth`). Update `usage.md:102`. |
| 24 | c-file-upload texts `waiting` → `queued` | CONFIRMED | `CFileUpload.vue:468` vs status `queued` (CONTEXT **Upload status**). Alpha-only. Update the four texts canons. |
| 25 | c-file-upload texts `dismiss` → `close` | CONFIRMED | `CFileUpload.vue:426`. The rejected row is **Closeable**. Also change the default string ("Dismiss …") and `usage.md:155` prose. |
| 26 | `CPlacement` rename | NEEDS-CALL | It isn't shared under the glossary rule, so the rule implies splitting it into three component-owned types, not one rename. The plan says "renamed". |
| 27 | Package-level types get a `C` prefix | CONFIRMED | `index.ts:265,278,292,301`. Also touches the hand-kept `csc-ui-react/src/index.ts:20,24,35`, the docs app (`useThemeSeeds.ts`, `ThemePlayground.vue`), `tag-map.mjs:367`, CONTEXT.md:531 and ADR-0048. |
| 28 | Entry snapshot guards exported type names | CONFIRMED | The spec reads types from the manifest only (`api-snapshot.node.spec.ts:222`). ADR-0074's Consequences already decide this. |
| 29 | Export the accordion value type | CONFIRMED | `CAccordion.vue:25`. The snapshot prints `AccordionValue` (`c-accordion/api.snapshot.json:10-26`), so renaming it to `CAccordionValue` changes the snapshot and must land before rc.1. |
| 30 | `number \| string` → `number` (menu/popover/tooltip `distance`, tooltip `delay`, steps `value`) | CONFIRMED | Every use is `Number()`/`+`. c-steps `value` was `number \| string` in 3.x (TS-only break). Keep the runtime coercion: Vue templates set static attributes as string properties (`c-step/basic.vue:3`). |
| 31 | c-menu `select` detail typed | CONFIRMED | `CMenu.vue:102` `{ value: unknown }` → `{ value: string \| undefined }`, matching c-menu-item `value?: string` (`CMenuItem.vue:206`). |
| 32 | c-slider `unit` default `'%'` → `''` | CONFIRMED | `CSlider.vue:281`. The 3.x default was also `'%'` (legacy `c-slider.tsx:62`), so this is a silent change for upgraders: the migration guide must say to add `unit="%"`. |
| 33 | c-option `selected` seeding: c-select must not emit | NEEDS-CALL | 3.x emitted `changeValue` on seed, so upgraders' models were filled by it. A silent seed leaves a v-model or bound value out of sync. The seed contract needs deciding. |
| 34 | c-pagination leaks its inner menu's `select` | CONFIRMED | `CMenu.vue:617` is bubbling and composed; `onPageSizeSelect` (`CPagination.vue:360`) doesn't stop it. The leak reaches c-data-table consumers too. |
| 35 | c-progress-bar `label` becomes the accessible name | CONFIRMED | Confirmed in Chromium: the label-wrapped `<progress>` (`CProgressBar.vue:3-19`) has an empty name. The D14 axe gate (`aria-progressbar-name`) needs this anyway. |

---

## Non-CONFIRMED items

### 3. c-icon `--c-icon-color`: NEEDS-CALL

**Evidence**
- `CIcon.vue:72`: `pathFill = var(--c-icon-color, ${props.color})`, applied as the `<path>`'s inline `fill` (`:8`).
- The docblock (`:27-35`) explains the hook: the `color` prop lands as the path's own inline declaration, "which inherited `color`/`currentColor` cannot override".
- The only internal user is c-list-item, which greys a disabled item's slotted icon: `CListItem.vue:302-309` sets `:host([disabled]) ::slotted(c-icon) { --c-icon-color: var(--c-on-surface-muted) !important; }`.
- "Recolour via `::part`" works only when `color` is unset. `::part(root)` reaches the `<svg>`, not the path's inline `fill`, so a `<c-icon color="…">` cannot be recoloured that way. No other mechanism lets a parent override it.
- "Undeclared" holds for the 4.x manifest (`cssProperties: []`). It was **documented** 3.x API: legacy `c-icon/readme.md:21` (CSS Custom Properties: `--c-icon-color`) and `c-icon.scss:3` (`@prop --c-icon-color`).
- `migration.ts:362` already says "Per-component CSS custom properties are gone", which covers 3.x users.
- c-icon has no usage.md.

**Hidden change:** dropping the hook outright breaks the disabled c-list-item's greyed icons.

**Recommendation:** do what the audit actually proposed: rename it to the private `--_c-icon-color` (the convention of `--_c-card-gap` and the like), and keep c-list-item on it. ADR-0006's "`--c-*` vars stay dropped" is then satisfied. Optionally name `--c-icon-color` in the migration-guide sentence at `migration.ts:362`.

### 4. c-modal `dismissable` / stray "dismissible": ALREADY-COVERED

**Evidence**
- `git show be413bd8 -- CONTEXT.md` changed **Rejected file** from "dismissible row" to "closeable row" (CONTEXT.md:269). It also added **Closeable**, with "_Avoid_: Dismissible", at :382-384.
- **Dismissable** (:378-380) stays the modal's light-dismiss property.
- `migration.ts` ("a dismissable prop (governs both backdrop-click and Escape)") agrees. Nothing is left to do for c-modal.

**Residue (no action unless wanted)**
- ADR-0071:52 still says "dismissible row". It is a historical record.
- The file-upload `dismiss` texts key, its "Dismiss …" default and `usage.md:155` ("the user can dismiss each one") belong to item 25.

### 5. `mobile` / `mobile-breakpoint` rename: WRONG-BUCKET

**Evidence**
- c-side-navigation `mobile` is 3.x (legacy `c-side-navigation.tsx:22` `@Prop() mobile: boolean`). It is the responsive side-nav switch and is documented in `c-side-navigation/usage.md:13`. The audit itself says "a common pattern".
- c-tabs `mobile-breakpoint` is 3.x (legacy `c-tabs.tsx:55`, readme row) and is 4.x `CTabs.vue:76`.
- c-table (`CTable.vue:32`) and c-login-card (`CLoginCard.vue:58`) keep `mobile-breakpoint`, which CONTEXT.md:359 grandfathers: "…are compact *component* layouts, a different concept, and keep their grandfathered names". Renaming only c-tabs leaves three tags with one name and one with another.
- Neither rename has a target ("state names").

**Recommendation:** drop the renames from "before rc.1". Keep the names grandfathered, and do item 6: c-tabs joins the list, c-steps leaves it, and side-nav `mobile` is described as consumer-set. If renames are wanted, put all four in the 4.x add+deprecate list together: `mobile-breakpoint` on c-table/c-login-card/c-tabs → one new name (e.g. `compact-below`), side-nav `mobile` → a presentation name (e.g. `slide-in`).

### 9. c-accordion-item `expanded` → internal: CONTRADICTS-DOCS

**Evidence**
- `packages/csc-ui-documentation/app/examples/c-accordion/custom-style.vue:27` (and `.typescript.html:5`, `.angular.ts:20`, `.react.tsx:9`) teaches the selector `c-accordion-item[expanded] { &::part(root) {…} }` for per-state styling.
- CONTEXT.md:698 (**Internal**): "Anything a consumer is meant to use is never internal."
- `expanded` is also read internally as the reflected attribute for the frame logic (`CAccordionItem.vue` comments near :256; ADR-0058:18-21).
- `expanded` is a 3.x prop (legacy `c-accordion-item.tsx:46`).
- The audit's own proposal was to keep `expanded` documented as reflected state, not to make it internal.

**Also:** once `item-change` is internal (D4) and these props are internal, an item without `value` can never expand. `applyExpansionToItems` skips it (`CAccordion.vue:150`), and its own toggle only emits.

**Recommendation:** either:
- add a `:state(expanded)` custom state (ADR-0035 pattern: "otherwise-invisible internal state"), move the canon to `c-accordion-item:state(expanded)::part(root)`, and then mark the prop internal; or
- keep `expanded` public as a read-only, accordion-driven state.

In both cases, document `value` as required on items inside c-accordion.

### 11. c-data-table `change:selected` detail: NEEDS-CALL

**Evidence**
- `CDataTable.vue:625`: `'change:selected': { ids: string[]; rows: CDataTableRow[] }`, built in `commitSelection` (`:946-959`) by resolving `rows` from the core row model.
- The `selected` prop is `string[]` (`:444`).
- The sibling `change:expanded` is `string[]` (`:610`). ADR-0017 says `change:<prop>` "keeps the 'mirrors the prop' readability".
- Alpha-era: 3.x had `selectable`/`selection` with no `selected` prop.
- The canon `selection.vue:39-44` (four flavours) retypes the detail inline and reads `.ids`.

**The call:** "detail = the `selected` value" means `string[]`, which drops `rows` (consumers use them for bulk actions). "With a named type" only makes sense if the object stays.

**Recommendation:** detail `string[]`, mirroring the prop like `change:expanded`, plus a read-only `selectedRows` property in the same PR (additive), so no data is lost. If `rows` must stay in the event, keep the object and export it as `CDataTableSelection`. Update the four selection canons either way.

### 12. c-data-table `filter` (string) rename: NEEDS-CALL

**Evidence**
- The claim is true: `CDataTable.vue:417` is `filter?: string`, used as the TanStack `globalFilter` (`:862-863`). On `CAutocomplete.vue:371` and `CTreeSelect.vue:414`, `filter` is a predicate.
- Alpha-era: not in legacy `c-data-table.tsx`.
- No canon and no usage.md use it.

**The call:** the plan names no target.
- CONTEXT **Query** (:52-54) has "_Avoid_: … filter string (one word for this concept — _query_)", which points to `query`.
- But the entry defines Query as the text typed into the **search input**, which resets on open. A data-table query is consumer-held text.

**Recommendation:** rename to `query` and widen the glossary entry, roughly: "the text narrowing a component's options or rows — typed into the search input (c-autocomplete, c-tree-select) or supplied by the consumer (c-data-table)". That keeps `filter` free for a later row predicate, consistent with ADR-0029's shared `external` vocabulary.

### 13. c-tooltip `content` slot → default slot: NEEDS-CALL

**Evidence**
- `CTooltip.vue:49`: `<slot name="content">{{ text }}</slot>`. c-tooltip is new in 4.x (no c-tooltip on `legacy-main`).
- **Hidden behaviour change**, verified in headless Chromium: for `<x-t>\n  <button slot="trigger">t</button>\n</x-t>`, the default slot's `assignedNodes()` were `["\n  ", "\n"]` and the fallback rendered as `""`. Whitespace text nodes are assigned to an unnamed slot, so the `{{ text }}` fallback never shows.
- The docs canon `c-tooltip/basic.typescript.html:1-5` (`<c-tooltip text="…">` + newline + `<c-icon-button slot="trigger">`) would show an empty bubble. Vue and Angular templates strip that whitespace, but plain HTML and the TS flavor do not.
- The `aria-description` path survives, because `contentSlotText()` (`:368-380`) trims and falls back to `text`.
- A default slot also catches a trigger that lacks `slot="trigger"` and puts it inside the tooltip panel: a focusable element in a tooltip, which ADR-0033 forbids.
- ADR-0033 (accepted, :41-48) names "the `content` slot" in its decisions, and `c-tooltip/usage.md:3` documents it.

**Recommendation:** keep the named `content` slot. It is alpha-only and doesn't conflict with the glossary; the gain is only parity with c-popover, which has no text fallback. If the move goes ahead:
- render `text` outside the `<slot>` whenever the default slot's assigned nodes are whitespace-only (track with `slotchange`);
- add a behaviour spec with whitespace-formatted HTML markup;
- amend ADR-0033 and usage.md.

### 14. c-menu-item `icon` prop → `icon` slot: NEEDS-CALL (minor)

**Evidence**
- The claim is true: `CMenuItem.vue:3-10` renders `<c-icon :path="icon" part="icon">`. The `icon` prop is `string = ''`, an icon path (glossary flagged ambiguity "Path").
- Alpha-only: 3.x had `c-menu-items`, with no c-menu-item.
- The docs canon `c-menu/submenu.vue:13-32` already puts `<c-icon>` in the **default** slot, and the default-slot doc says "label text plus optional icons".
- Siblings with an `icon` slot (c-button, c-accordion-item, c-breadcrumb-item) have **no** `icon` part.

**Open points the plan skips**
- `active-icon` (`:186`, `:19`) is the same icon-path pattern.
- Whether the `icon` part goes away. It would, if the item follows its siblings.

**Recommendation:** add an `icon` slot like c-button's and remove the `icon` part. Remove `active-icon` too: the check mark is a fixed state cue, recoloured via `::part(check)`. That way no icon-path prop is frozen.

### 15. c-menu-item `active` two-state + checkable/type switch: NEEDS-CALL

**Evidence**
- `CMenuItem.vue:178,210-215,239`: `active` defaults to `undefined`, `isCheckable = props.active !== undefined`.
- `:383-388`: role `menuitemradio` + `aria-checked` only when `active` is defined. The snapshot hides this (`"active": "boolean"`).
- Alpha-only. No canon sets `active` on a menu item.

**The call:** the plan says "checkable/type switch" without picking.

**Hidden change:** every existing `active="false"` (an unchecked radio choice) and React `active={false}` becomes a plain `menuitem` with no `aria-checked`, unless the new switch is added. Screen-reader semantics change with no error.

**Recommendation**
- Use a union `type: 'command' | 'radio'` (built-in `'command'`). ADR-0074 lets a union widen later (`'checkbox'`) as a minor change; a `checkable` boolean cannot.
- While the name is still alpha-only, consider `checked` instead of `active`. The docblock already has to separate this `active` from the menu's `data-active` keyboard highlight. Glossary **Active** is c-button's pressed state, and the custom-state vocabulary uses `checked`.
- Say in the migration notes that radio items now need `type="radio"`.

### 20. List-row part `item` vs `option`: NEEDS-CALL

**Evidence**
- `part="item"` appears on `CDropdown.vue:94,134` (forwarded by c-select's `exportparts="menu, list, item, …"`, `CSelect.vue:16`), `CAutocomplete.vue:270` and `CTreeSelect.vue:275`.
- `part="option"` appears on `CDatePicker.vue:231,358` and `CTimePicker.vue:119`.
- All of these rows are `role="option"`.
- Glossary: an item is "an `items` entry" (CONTEXT.md:254, :604). Tree-select **Branch/Leaf** calls its rows items (:108), which makes `item` defensible there only.
- No usage.md or canon references `::part(item)` or `::part(option)`.

**The call:** the plan says "unified" but not which name wins.

**Recommendation:** use `option` on all five: c-select (via the internal c-dropdown and its `exportparts` list), c-autocomplete and c-tree-select. It matches the ARIA role, the `c-option` element and the pickers, and leaves "item" for data. Batch it with D12's c-select `menu` → `panel`, which edits the same `exportparts` line.

### 22. c-tree-select texts `step`: NEEDS-CALL

**Evidence**
- `CTreeSelect.vue:615`: `step?: (n, total) => string`, default `` `Step ${n} of ${total}` `` (`:857`). It is the header's level counter (`:1084-1088`).
- CONTEXT.md:114 (**Level**) says "_Avoid_: Depth, tier, step, layer". `usage.md:51` uses "the steps ("Step 2 of 3")".
- The plan lists `step` with no target. The audit proposed `levelCount`, but "count" reads as the total alone.

**Recommendation:** `levelCounter`. The docblock already calls it the "step counter", which becomes "level counter". Fix the usage.md prose too. The default English string may keep saying "Step": default strings are not public API.

### 26. `CPlacement` rename: NEEDS-CALL

**Evidence**
- `types.ts:23` exports a union used by `position` on c-menu (`:146`), c-popover (`:67`) and c-tooltip (`:71`), plus internal helpers (`shared/positionArea.ts`, `useFallbackPosition.ts`, the c-menu-item submenu fallbacks).
- No value crosses a component boundary, so by CONTEXT **Shared type** (:705-707: "two components declaring the same union is heritage, not contract") it is not shared.
- The per-tag manifest inlines the union (`c-menu/api.snapshot.json:5`), so only the entry type list changes.

**The call:** "renamed" implies one new name, but the rule the plan cites implies a split. The audit left both open (split, or a shared `CPosition` with a written reason).

**Recommendation:** split into `CMenuPosition`, `CPopoverPosition` and `CTooltipPosition` in their SFCs, each named after the prop. The helpers keep a private `Placement` type. The structurally identical unions stay assignable for consumers.

### 33. c-option `selected` seeding: NEEDS-CALL

**Evidence**
- `CSelect.vue:1399-1432` (`refreshOptions`) calls `emitValue`, which runs `emitModelValue` (`:804-811`): `update:value` + `input`.
- It runs on mount and on every child mutation (`:1452-1455` + the MutationObserver). In single mode this happens even when `value` is already set.
- c-autocomplete seeds silently and only while `value == null` (`CAutocomplete.vue:1734-1739`).
- A pinned deviation already exists: `CSelect.spec.ts:201` `it.fails('does not emit when a slotted <c-option selected> seeds the value at mount')`.
- CONTEXT **Value control** (:748): "Emission happens only on user interaction".

**Hidden change for upgraders:** 3.x c-select emitted `changeValue` on seed (legacy `c-select.tsx:465-475`, in `_onSlotChange`), so a 3.x app's v-model / v-control model was **filled** by `<c-option selected>`. With a silent seed, a Vue `v-model` (which binds `null`, or `''` via vModelText) and React state never learn the seeded value. The field shows "Sweden" while the model holds `null`.

**Recommendation:** make the seed silent, apply it only while `value` is empty, and apply it once rather than on every child mutation, matching c-autocomplete. Document `<c-option selected>` as the initial value for plain HTML: with a bound value, initialise the model instead. Add a migration-guide entry. The alternative is to drop `selected` as a seed (one source of truth, the ADR-0031 principle), but `<c-option selected>` is common 3.x markup, so a silent seed is the cheaper break.

---

## Side findings (outside the D13 list, found while checking)

- **c-alert's `dismiss` part.** c-alert also has a `dismiss` **part** (`c-alert/api.snapshot.json` parts; `c-alert/usage.md:24`), besides the `dismiss` event and `dismissible` prop. D12 says "`dismissible`/`dismiss` → `closeable`/`close`". Make sure the part is renamed as well. The fields already use a `close` part for their close buttons.
- **Glossary inconsistencies.**
  - **Toast** (CONTEXT.md:321, :329) still calls c-toast's close button the "dismiss button", while **Closeable** (:383) lists c-toast.
  - **Closeable** says a closeable surface "fires `close`", but c-file-upload's rejected row fires no event (events: `change`, `input`, `reject`, `update:value`).
- **Stale theme docs table.** `customization.ts:597-602` lists `ring` with dark `accent-400`, but dark.json:18 has `primary-300` (ADR-0034). Removing `ring` (item 1) removes this stale row.
- **ADR-0074 and palette tokens.** ADR-0074 makes "semantic token names" public, but `--c-text-*`/`--c-transparent` are palette-block tokens. Their freeze status after 4.0 would be unclear, which is another reason to remove them before rc.1 (item 2).
