# API audit before 4.0.0: layout, display, data, login + package exports

Scope: c-accordion, c-accordion-item, c-alert, c-badge, c-button, c-icon-button, c-card(-actions/-content/-title), c-csc-logo, c-data-table, c-table, c-divider, c-icon, c-list(-item/-item-title), c-loader, c-spinner, c-progress-bar, c-progress-circle, c-login-button(s), c-login-card(-actions/-content/-title), c-main, c-page, c-message, c-status, c-tag, c-tags. Package level: `src/index.ts`, `src/types.ts`, `css/*` (tokens.css, tailwind-theme.css), semantic token names.

Paths are relative to `/workspace/packages/csc-ui/` unless stated otherwise. I checked every claim against the SFC, `api.snapshot.json`, `usage.md`, the generated `src/tag-name-map.ts` and the token output.

This audit does not repeat decisions that are already being implemented: removing the camelCase events (including c-accordion `changeValue`), giving every value control the `input` + `update:value` + `change` events, and making `item-change` internal.

Counts: **12 break-now**, **17 consider**, **9 note**.

---

## break-now

### index.ts — `migratedTags` and `tailwindVariantTags` are maintainer tooling exported as runtime API
**Severity** break-now
**What** `src/index.ts:444` `export const migratedTags` and `src/index.ts:451` `export const tailwindVariantTags`. Both are listed in `src/api.entry.snapshot.json:14,18`.
**Why** `tailwindVariantTags` is a progress list of the tailwind-variants conversion ("Used by the docs to mark conversion progress"). Nothing in the repo imports it any more. `migratedTags` is imported only by the conformance specs (`src/test/conformance/*.spec.ts`). It also includes the internal-only `c-dropdown`, which the glossary says is "documented nowhere" (CONTEXT.md "Composed child"). The name uses _migrate_, which the glossary reserves for the maintainers' internal Stencil-to-Vue port (CONTEXT.md "Upgrade"). Once 4.0.0 ships, neither list can be removed until 5.0.
**Proposed fix** Remove both from the entry. Move `migratedTags` into an internal module (e.g. `src/registry.ts`) that the tests import. If a public tag list is wanted, export one under a neutral name (`tagNames`) with `c-dropdown` excluded.
**Migration cost** None known. No consumer use found; the conformance specs need a one-line import change.

### c-loader — `visible` is a boolean that defaults to `true`, so markup cannot hide the loader
**Severity** break-now
**What** `src/components/c-loader/CLoader.vue:130` `visible?: boolean` with built-in default `true` at `:143`; snapshot `"visible": "boolean = true"`. The component does not call `coerceBoolean`, so `visible="false"` reaches it as the truthy string `"false"`. Removing the attribute restores the default `true`.
**Why** An HTML boolean attribute can only switch a feature on. The docs' TypeScript example has to set `loader.visible = …` from script (`csc-ui-documentation/app/examples/c-loader/basic.typescript.ts`). The prop replaced Stencil's `hide` (default false, comment at `:122`), and the migration guide does not mention the rename (`csc-ui-documentation/app/content/migration.ts`, "Other components").
**Proposed fix** Recommended: restore the 3.x `hide` boolean (default `false`) and drop the `show()`/`hide()` methods (`:186`), because setting the property is already the imperative API. This makes 3.x markup work unchanged. Alternative: keep `visible` with a default of `false`, like `<dialog open>`, but then every bare `<c-loader>` is hidden.
**Migration cost** 4.x-alpha users who bind `visible`. With the recommended fix, 3.x users who used `hide` need no change.

### c-loader — `contentdelay` is an unhyphenated attribute measured in seconds
**Severity** break-now
**What** `src/components/c-loader/CLoader.vue:108` `contentdelay?: number`, applied as `` animationDelay: `${contentdelay}s` `` (`:18`); snapshot `"contentdelay": "number = 0"`.
**Why** It is the only multi-word prop in the group that is neither camelCase nor kebab-case (compare `scroll-indicator`, `disable-layout`). It is also the only duration in seconds: `c-tooltip` `delay` is in ms (default 400, `c-tooltip/CTooltip.vue:158`) and `CToastMessage.duration` is in ms (`src/types.ts`).
**Proposed fix** Rename to `content-delay` / `contentDelay`, measured in milliseconds. `message-delay` is an alternative that uses the glossary's "optional message" wording (CONTEXT.md "Loader").
**Migration cost** Every 3.x and 4.x consumer who sets the delay. It is one attribute, but the value changes too (`1` becomes `1000`).

### c-button, c-list-item — `target` defaults to `'_blank'`; every sibling defaults to `''`
**Severity** break-now
**What** `src/components/c-button/CButton.vue:499` and `src/components/c-list-item/CListItem.vue:151` set `target: '_blank'`. `c-link`, `c-breadcrumb-item`, `c-side-navigation-item` and `c-sub-navigation-item` all use `"target": "string = ''"` (their api.snapshot.json files).
**Why** The same concept (the link target when `href` is set) has two built-in defaults. A link-styled `c-button` or a linked `c-list-item` opens a new tab, while every other linking component stays in the same tab, and so does native `<a>`. Changing a built-in default after 4.0.0 is breaking (CONTEXT.md "Public API").
**Proposed fix** Change the built-in default to `''` on both.
**Migration cost** Consumers who rely on the new-tab default must add `target="_blank"`. That probably includes 3.x users, since the prop is seeded from 3.x.

### c-alert — the close affordance uses different vocabulary from c-tag for identical behaviour, and `dismissible` clashes with `dismissable`
**Severity** break-now
**What** `src/components/c-alert/CAlert.vue:44` `dismissible?: boolean`, `:102` event `dismiss`, `:20` hard-coded `aria-label="Dismiss"`, part `dismiss`. In `c-tag/CTag.vue` the same pattern (an × that only emits, removal left to the consumer) is `closeable` + event `close` + `close-label` (default `'Remove'`). c-toast also emits `close`. c-modal spells its prop `dismissable` (`c-modal/api.snapshot.json`).
**Why** Two components with the same behaviour have different prop and event names, and the frozen API would contain two spellings of the same word (`dismissible` on the alert, `dismissable` on the modal). The glossary reserves **Dismissable** for the modal's backdrop-plus-Escape contract, which is a different concept from a close button (CONTEXT.md "Dismissable"). The alert's names are new in 4.x (added 11d0dcb7, 2026-08-28), so renaming them is cheap.
**Proposed fix** Rename `dismissible` to `closeable` and the `dismiss` event to `close`, matching c-tag and c-toast. The `dismiss` part can stay, since it matches c-toast's part. Optionally add `close-label` like c-tag (adding it is non-breaking).
**Migration cost** 4.x-alpha adopters of `dismissible` and `@dismiss` (the MyCSC alert migration). 3.x users are unaffected.

### c-alert — exported type `CAlertIconType` has a misleading name
**Severity** break-now
**What** `src/components/c-alert/CAlert.vue:37` `export type CAlertIconType = 'error' | 'info' | 'success' | 'warning'`, re-exported at `src/index.ts:83`. Its only use is to build `CAlertType` (`:67`).
**Why** Its own doc says "Every type renders its status icon", including `default`, so the "icon type" is not a concept. The name breaks the `C<Component><Concept>` rule (CONTEXT.md "Component-owned type"), and removing an export later is breaking.
**Proposed fix** Inline it into `CAlertType` and stop exporting it. If a status subset is needed, call it `CAlertStatusType`.
**Migration cost** Anyone importing the type. That is unlikely, since no prop is typed with it.

### c-accordion-item — the heading slot is named `header`
**Severity** break-now
**What** `src/components/c-accordion-item/CAccordionItem.vue:17,45`: `<slot name="header">` replaces the `heading` prop's text. Snapshot slots are `default, header, icon`.
**Why** The glossary says components accept a heading "under the name `heading`, prop and slot alike" and lists "an accordion item" as an example. It treats _header_ as a region that may *contain* a heading (CONTEXT.md "Heading"). The sibling `c-alert` already pairs the `heading` prop with a `heading` slot. The `header` *part* (the whole toggle row) is correctly named and can stay.
**Proposed fix** Rename the slot to `heading`. Optionally add a `heading` part on the heading text, as c-alert and c-popover have (adding it is non-breaking).
**Migration cost** 3.x and 4.x consumers who use `slot="header"` on accordion items.

### c-list-item — `disabled-by-parent` is wiring between parent and child, published as public API
**Severity** break-now
**What** `src/components/c-list-item/CListItem.vue:111` `disabledByParent?: boolean`; snapshot `"disabled-by-parent"`. Only `c-list` writes it (`c-list/CList.vue:101`), to remember which items it disabled.
**Why** It is bookkeeping between parent and child that a consumer should never set; setting it makes `c-list` re-enable the item. It is the property-side equivalent of the internal events already being removed from the manifest (CONTEXT.md "Internal event"; brief item 3).
**Proposed fix** Drop the prop. Track the list-disabled items in c-list itself, for example with a `WeakSet` or a private `data-` marker the list owns.
**Migration cost** None for legitimate use.

### c-message — `input-id` is a dead public prop
**Severity** break-now
**What** `src/components/c-message/CMessage.vue:81` `inputId?: string` ("Id of the related input element"), default `''` at `:94`. Nothing in the component reads it; the template has no id or aria wiring.
**Why** After 4.0.0 a no-op name would be frozen, and it implies an association that does not exist.
**Proposed fix** Remove it. Alternatively make it real: stamp the message id so a consumer input can point `aria-describedby` at it. Light DOM cannot reach a shadow id, so removal is the realistic option.
**Migration cost** Consumers who pass it: no behaviour change, but TS users get a type error.

### c-table — `updateMobileLabels()` is documented but missing from the manifest and types; it and `no-mobile-labels` use "mobile" outside the grandfathered names
**Severity** break-now
**What** `src/components/c-table/usage.md:10` tells consumers to call `updateMobileLabels()`. The method is attached by hand at `c-table/CTable.vue:150-151` instead of through `defineExpose`, so the snapshot has `"methods": {}` and the generated `CTableElement` (`src/tag-name-map.ts:2386`) has no such method; TS consumers following the doc get a type error. `usage.md:9` documents a `no-mobile-labels` attribute for `<tr>` (`CTable.vue:67`) and the `c-table__mobile-label` class.
**Why** This is brief item 5: documented in the usage doc but absent from the snapshot. The glossary allows "mobile" only in the existing `mobile`/`mobileBreakpoint` prop names (CONTEXT.md "Narrow viewport"), and these two names are new.
**Proposed fix** Expose the method through `defineExpose` under a neutral name such as `refreshLabels()` (or `updateCellLabels()`). Rename the row opt-out to `no-cell-labels` and the class to `c-table__cell-label`. If the method is not wanted, delete it and its line in usage.md.
**Migration cost** Low. The method and attribute are probably 4.x additions (they appear only in the 4.x usage.md), so only alpha adopters of responsive tables are affected.

### c-data-table — `texts.selectAllItems` names table rows "items"
**Severity** break-now
**What** `src/components/c-data-table/CDataTable.vue:511` `selectAllItems?: (count) => string`, with default text "Select all ${count} rows" (`:669`). The other keys say "row": `selectRow` (`:517`), `expandRow` (`:499`).
**Why** The glossary reserves _item_ for an `items` entry (CONTEXT.md "Select-all row": "Avoid: Select-all item (an item is an `items` entry)"); the data table has no `items`, only `data` rows. `texts` keys are public API (CONTEXT.md "Public API"), and the component is new in 4.x, so renaming is cheap now.
**Proposed fix** Rename to `selectAllRows`.
**Migration cost** 4.x-alpha consumers who translate this key, including any `applyDefaults({'c-data-table': {texts}})`.

### types.ts — `CToastMessage.title` is a heading
**Severity** break-now
**What** `src/types.ts:83` `title?: string` ("Optional title rendered above the message"); c-toast renders it as the toast's heading (`c-toast/CToast.vue:21`).
**Why** The glossary says: "Heading … components accept it under the name `heading` … Avoid: Title (`title` is the native tooltip attribute)" (CONTEXT.md "Heading"). Every other heading in the library is `heading` (c-alert, c-accordion-item, c-popover).
**Proposed fix** Rename the field to `heading`.
**Migration cost** 3.x and 4.x callers of `addToast({ title })`. Unless the field is renamed in their code, the heading silently disappears at runtime, so the upgrade guide needs an entry.

---

## consider

### c-data-table — the `change:selected` detail does not mirror the `selected` prop, and its type is anonymous
**Severity** consider
**What** `src/components/c-data-table/CDataTable.vue:625` `'change:selected': { ids: string[]; rows: CDataTableRow[] }`, while the prop `selected` is `string[]` (`:444`). The sibling events mirror their props exactly: `change:expanded` gives `string[]`, `change:page` a number, `change:sort` a `CDataTableSort | null`.
**Why** ADR-0017 defines `change:<prop>` as the counterpart to `:prop`. Here the round trip needs `$event.detail.ids`, and the docs example has to retype the detail inline (`csc-ui-documentation/app/examples/c-data-table/selection.vue:40-43`) because no named type exists.
**Proposed fix** Either make the detail `string[]` and expose the resolved rows through a read-only `selectedRows` property, or keep the object and export it as `CDataTableSelection`.
**Migration cost** Low; the component is new in 4.x.

### c-data-table — `filter` is a string here but a predicate function in c-autocomplete and c-tree-select
**Severity** consider
**What** `src/components/c-data-table/CDataTable.vue:417` `filter?: string` is the filter text. In `c-autocomplete/CAutocomplete.vue:371` and `c-tree-select/CTreeSelect.vue:414`, `filter` is a predicate (`CAutocompleteFilter`, `CTreeSelectFilter`), and the text is the **query**.
**Why** ADR-0029 calls `external` plus `change:*` "one vocabulary for consumer-owned data across the library" on c-data-table and c-autocomplete. The same prop name meaning two different things in those two components undermines that, and it blocks a future row-predicate prop.
**Proposed fix** Rename the data-table prop to `query` (string). That leaves `filter` free for a later `(row, query) => boolean`.
**Migration cost** 4.x-alpha data-table users; the component is new in 4.x.

### c-spinner, c-loader, c-progress-circle — `width` means stroke thickness, but box width on c-modal and c-csc-logo
**Severity** consider
**What** `c-spinner/CSpinner.vue:83` (default 2), `c-loader/CLoader.vue:137` (default 4, described as "Width of the loader"), and `c-progress-circle/CProgressCircle.vue:123` (default 6) use `width` for the stroke. `c-csc-logo/CCscLogo.vue:66` (60) and `c-modal` (`number | string = 600`) use it for the element's width.
**Why** One attribute name has two meanings in the frozen API. `size` + `width` (stroke) + `value` is Vuetify's `v-progress-circular` vocabulary, and the glossary already rejects Vuetify naming for this component (CONTEXT.md "Progress circle": "Avoid: Progress circular (Vuetify vocabulary)"). c-progress-circle is new in 4.x, so it costs the least to rename.
**Proposed fix** Rename the stroke prop to `thickness` (or `stroke-width`) on all three. If 3.x compatibility for c-spinner and c-loader matters more, rename only c-progress-circle now. Related but out of scope: `size` is pixels on c-icon, c-spinner, c-loader and c-progress-circle but a step union on c-button, c-icon-button, c-tag and the fields. That is conventional and I do not recommend changing it.
**Migration cost** 3.x users of c-spinner and c-loader `width`; for c-progress-circle, only alpha users.

### c-accordion-item — `collapsable`, `outlined` and `expanded` are parent wiring; `collapsable` is also misspelled
**Severity** consider
**What** `src/components/c-accordion-item/CAccordionItem.vue:207,214,229`. c-accordion overwrites all three on every item that has a value (`c-accordion/CAccordion.vue:152-155`): `collapsable` is computed from `mandatory`, and `outlined` and `expanded` are pushed down from the accordion. A consumer's value inside an accordion does not survive.
**Why** The props look configurable per item but are not (brief item 3). Once `item-change` becomes internal, a standalone item has no public event, so these props are wiring in practice. The standard spelling is "collapsible".
**Proposed fix** Remove `collapsable` and `outlined` from the item's public API (set them through a private channel). Document `expanded` as reflecting state driven by `c-accordion`. If `collapsable` stays public, spell it `collapsible`.
**Migration cost** Consumers who set `collapsable` or `outlined` on items. Inside an accordion the value was overwritten anyway, so behaviour does not change.

### c-list-item-title — `active` is driven by the parent
**Severity** consider
**What** `src/components/c-list-item-title/CListItemTitle.vue:43` `active?: boolean`. `c-list-item/CListItem.vue:199` overwrites it from the item's own `active`.
**Why** This is wiring published as API (brief item 3); a consumer value is overwritten whenever the item re-renders.
**Proposed fix** Make it internal. A `:state(active)` or a private attribute set by the item would work.
**Migration cost** Negligible.

### c-button `no-ripple` vs c-list-item `ripple` — opposite polarity, and `ripple` also controls focusability
**Severity** consider
**What** `src/components/c-button/CButton.vue:128` `noRipple` is new in 4.x and is set by `c-button-group/CButtonGroup.vue:424` on its children. `src/components/c-list-item/CListItem.vue:133` `ripple` is opt-in and also decides whether the host gets `tabindex="0"` (`:192`). c-icon-button always ripples and has no prop.
**Why** The same feature is switched on in one component and off in another. `no-*` occurs nowhere else in the library apart from c-button's `no-radius`; every other opt-out uses `disable-*` (5 props). On c-list-item, `ripple` actually means "interactive item".
**Proposed fix** Make `noRipple` internal (it is parent wiring, like `disabledByParent`). On c-list-item, give interactivity its own name (e.g. `interactive`, or make `hoverable` imply focus) and keep `ripple` purely visual.
**Migration cost** c-button: alpha only. c-list-item: 3.x users who rely on `ripple` for focusability.

### c-button, c-icon-button — `outlined`, `ghost` and `text` are one appearance axis split into three booleans
**Severity** consider (high cost)
**What** `CButton.vue:88,135,157` and `CIconButton.vue:66,87,109`. Combinations that contradict each other, such as `ghost outlined text`, resolve by tailwind-merge source order and are undocumented. `text` is the old Vuetify 2 `v-btn` prop name and reads as label content.
**Why** The glossary states the principle elsewhere: "One axis, so contradictory flag combinations are unrepresentable" (CONTEXT.md "Expansion policy").
**Proposed fix** Use a single `variant: 'filled' | 'outlined' | 'ghost' | 'text'`, with built-in default `filled`, plus a `CButtonVariant` type. Keep `danger` and `inverted`, which are independent axes.
**Migration cost** Very high: nearly every 3.x button. Do this only if the upgrade guide is already asking consumers to touch buttons.

### c-card — `fullscreen` names a state, but it switches on a toggle button
**Severity** consider
**What** `src/components/c-card/CCard.vue:85` `fullscreen?: boolean` ("Enable the fullscreen toggle button"). The `enterFullscreen()` and `exitFullscreen()` methods work whatever its value.
**Why** `fullscreen` reads as "is in fullscreen". The library's other opt-in buttons are named `show-<thing>` (`show-today`, `show-now`, `show-week-numbers`; ADR-0065).
**Proposed fix** Rename to `show-fullscreen`.
**Migration cost** 3.x users of `fullscreen` (the prop is seeded from 3.x).

### c-progress-bar — `label` is not the accessible name, unlike the glossary's Label and unlike c-progress-circle
**Severity** consider
**What** `src/components/c-progress-bar/CProgressBar.vue:109` `label` is only appended to the visible details line (`{{ value }} % {{ label }}`, `:27`). The `<progress>` has no accessible name, and `inheritAttrs: false` (`:43`) stops a host `aria-label` from reaching it. c-progress-circle names its progressbar through a host `aria-label` that falls through (its `usage.md`).
**Why** The glossary defines **Label** as the name wired to the control for assistive technology. Here the progressbar cannot be named at all, and the two progress components use different naming routes.
**Proposed fix** Keep the prop name but make `label` the progressbar's accessible name (`aria-label` or `aria-labelledby` the details line). Also forward a host `aria-label`, matching c-progress-circle.
**Migration cost** None (behaviour is additive).

### c-status vs c-alert — the neutral look is expressed differently
**Severity** consider
**What** `src/components/c-status/CStatus.vue:21` `CStatusType = 'error' | 'info' | 'success' | 'warning'`, with no default: omitting the attribute gives the neutral pill. `c-alert/CAlert.vue:67` `CAlertType = 'default' | …`, with built-in default `'default'`.
**Why** The same concept (a status type, where neutral is the default) has two shapes. Under the alert's model `type="default"` is valid; under the status model it is an unknown value.
**Proposed fix** Add `'default'` to `CStatusType` with built-in default `'default'` (or drop it from c-alert; adding is the cheaper direction).
**Migration cost** None for markup. TS code that exhaustively switches on `CStatusType` has to handle the new member.

### c-accordion — the value type is private and not named `C<Component><Concept>`
**Severity** consider
**What** `src/components/c-accordion/CAccordion.vue:25` `type AccordionValue` is not exported; the manifest and `tag-name-map.ts` inline it as a local type. The sibling `CButtonGroupValue` has the same shape and is exported (`c-button-group/CButtonGroup.vue:88`).
**Why** The glossary requires component-owned types to be exported and named `C<Component><Concept>` (CONTEXT.md "Component-owned type"). Consumers who bind `value` cannot name it.
**Proposed fix** Export `CAccordionValue` from the SFC and the entry. Adding it is non-breaking but cheap to do now.
**Migration cost** None.

### c-login-button — part `title`
**Severity** consider
**What** `src/components/c-login-button/CLoginButton.vue:9,23` `part="title"`, "the bottom title bar wrapping the slotted label".
**Why** The glossary says to avoid _title_ (CONTEXT.md "Heading", "Label"), and the region holds the button's label. Parts are mostly new in 4.x, which removed per-component CSS variables, so renaming one now affects only alpha users.
**Proposed fix** Rename the part to `label`.
**Migration cost** 4.x `::part(title)` rules.

### c-icon — `--c-icon-color` is an undeclared hook in the public token namespace
**Severity** consider
**What** `src/components/c-icon/CIcon.vue:72` fills with `var(--c-icon-color, <color>)`. `c-list-item/CListItem.vue:308` sets it. The snapshot has `cssProperties: []`.
**Why** It inherits, so any consumer can rely on it, but it is neither declared in the manifest nor marked private. The library's private hooks use `--_c-…` (`--_c-card-gap`, `--_c-alert-ink`, `--_c-button-min-height`). `--c-…` is the token namespace, and ADR-0006 makes `::part()` the customization API. The only declared custom property is c-main's `--c-main-viewport-height`.
**Proposed fix** Rename it to `--_c-icon-color`. If it is meant for consumers, declare it with `@cssprop`.
**Migration cost** Consumers who discovered the hook; probably none.

### c-message — `valid` defaults to `true`, so markup cannot mark it invalid
**Severity** consider (cross-cutting)
**What** `src/components/c-message/CMessage.vue:88,95` `valid: boolean = true`. Without `coerceBoolean`, `valid="false"` arrives as a truthy string. The TS example has to set `.valid = false` from script (`csc-ui-documentation/app/examples/c-message/basic.typescript.ts`).
**Why** This is brief item 4. The `valid = true` default appears on about 14 tags library-wide; some coerce `"false"` (c-radio-group, c-file-upload) and some do not, so whether `valid="false"` works in markup depends on the component.
**Proposed fix** Decide once for the whole library. Either use `invalid` (default false) everywhere, or keep `valid` and coerce `"false"` in every component (c-message included). c-message's role should also be checked: only `c-otp-input` renders it, while the other fields use the internal `shared/FieldMessage.vue`.
**Migration cost** For an `invalid` rename, every form consumer. That is very high and probably out of reach; the coercion route costs nothing.

### Tokens — `--c-ring` / `ring` is a public semantic role that nothing uses
**Severity** consider
**What** `tokens/semantic/light.json:18` `"ring": "primary-500"` produces `--c-ring` (`src/styles/css/tokens.css:177,276,…`) and the `--color-ring` utility (`src/styles/css/tailwind-theme.css:40`). No component references it.
**Why** The glossary says the `ring` token is "currently used by no component" and flags "Ring" as overloaded (CONTEXT.md "Flagged ambiguities"). ADR-0039 rejected it as the focus colour, so it is a public role with no defined use that would be frozen.
**Proposed fix** Remove it before 4.0.0. Alternatively, rename it to its intended role (e.g. `focus`) and document it.
**Migration cost** Consumers who adopted `ring-ring`/`--c-ring` from the Tailwind export; unlikely.

### Tokens — Stencil-era tokens `--c-text-*` and `--c-transparent` look like roles but are mode-independent palette values
**Severity** consider
**What** `src/styles/css/tokens.css:111-113,128-129`: `--c-text-dark`, `--c-text-light`, `--c-transparent`, `--c-text-body` (`var(--c-primary-900)`), `--c-text-system` (`var(--c-tertiary-600)`). Source: `tokens/theme/base.json:318,326,367,370`. They are emitted in the palette block, so they do not change with the theme mode.
**Why** `text-body` and `text-system` read like roles, but they do not switch in dark mode; this is the trap the semantic layer exists to remove. The glossary says: "on- token … Avoid: … text token (use `on-<role>`)". `--c-transparent` duplicates a CSS keyword. All five would be frozen as part of `css/tokens.css`.
**Proposed fix** Remove them from `base.json`, and move c-pagination and c-navigation-button (the only users of `--c-text-system`) onto `on-surface-muted`. If 3.x compatibility matters, keep them but document them as palette constants.
**Migration cost** 3.x consumers who reference `var(--c-text-body)` and similar in their own CSS.

### index.ts — package-level types have no `C` prefix, and the entry snapshot does not guard them
**Severity** consider
**What** The exports `Family`, `ThemeSeeds` (`src/index.ts:278`), `ChartSlots`, `ChartAnatomy` (`:292`), `ThemeMode` (`:301`), `AppDefaults`, `DefaultableTag` (`:265`), and through `export type * from './tag-name-map'` (`:271`) every `C*Element` and `C*ElementEventMap`. That includes `CDropdownElement` and `CDropdownElementEventMap` for the internal-only `c-dropdown`. `src/api.entry.snapshot.json` lists only the component types gathered from the manifest, so none of these names are covered by the freeze guard.
**Why** All other public types follow `C<Component><Concept>` (CONTEXT.md "Component-owned type"). Bare names like `Family` and `ThemeMode` exported from a library root are easy to collide with. More importantly, these names will be frozen without the API snapshot ever checking them.
**Proposed fix**
1. Extend `api-snapshot.node.spec.ts` so it records every exported type name.
2. Decide on a prefix (`CThemeFamily`, `CThemeSeeds`, `CThemeMode`, `CChartSlots`, `CChartAnatomy`, `CAppDefaults`, `CDefaultableTag`), or record in CONTEXT.md that package-level types are deliberately unprefixed.
3. Leave `c-dropdown` out of the generated element map, or document it as reserved.
**Migration cost** Type-only renames, and only if prefixes are adopted.

---

## note

### c-icon-button — its size scale does not match c-button's
**Severity** note
**What** `src/components/c-icon-button/CIconButton.vue:116` `CIconButtonSize = 'default' | 'small' | 'x-small'` (40, 32 and 28 px; `:159-163`). c-button's sizes are `small` 28 / `default` 52 / `large` 60. No other size union has `x-small`.
**Why** The same word means different pixel sizes in the two components. `x-small` is used internally (c-tag's close button, the pickers), so renaming it costs real work.
**Proposed fix** No rename. Record the icon-button scale in the CONTEXT.md "Control height" entry.
**Migration cost** None.

### c-alert, c-card — hard-coded English accessible names
**Severity** note
**What** `c-alert/CAlert.vue:20` `aria-label="Dismiss"`; `c-card/CCard.vue:5,7` "Enter fullscreen" / "Exit fullscreen".
**Why** These cannot be translated. Adding a `close-label` or a `texts` prop later is non-breaking, so this does not block 4.0.0. c-tag's per-instance `close-label`, compared with c-select's `texts.remove`, is a related inconsistency.
**Proposed fix** Add a defaultable `texts` (`{ close }`, `{ enterFullscreen, exitFullscreen }`) when convenient.
**Migration cost** None.

### types.ts — the `CFieldSize` doc gives a stale height
**Severity** note
**What** `src/types.ts:11` says "`default` is the 44px field". ADR-0055 and the c-text-field `size` doc give 52px.
**Proposed fix** Correct the comment, which shows in IDE hovers.
**Migration cost** None.

### package.json — the wildcard `./css/*` export publishes whatever is in `dist/styles/css`
**Severity** note
**What** `package.json` exports `"./css/*": "./dist/styles/css/*"`. The local working tree holds stale, git-ignored, unbuilt `src/styles/css/theme.css` (old hex palette with no 50/950 steps), `scss/_theme.scss` and `tailwind/theme.js`, and `scripts/copy-styles.js` copies the whole `src/styles` tree into `dist`. A CI publish from a clean checkout is fine, but a local publish would freeze `css/theme.css`. The package `description` is also stale ("Vue 3-based replacement for @cscfi/csc-ui").
**Proposed fix** Export `./css/tokens.css` and `./css/tailwind-theme.css` explicitly, or have copy-styles copy only those two files.
**Migration cost** None.

### index.ts — exported constants use mixed casing
**Severity** note
**What** `DEFAULTABLE_PROPS`, `DEFAULT_SEEDS`, `FAMILIES` are SCREAMING_CASE; `chartSlots`, `chartSlotsHex`, `chartAnatomy`, `chartAnatomyHex` are camelCase (`src/index.ts:259-297`).
**Proposed fix** Pick one convention before the freeze, or accept the mix deliberately.
**Migration cost** Import renames, if anything changes.

### Standalone tags with no usage.md ship with an empty description
**Severity** note
**What** These standalone tags (not composed children) have no `usage.md`, so their manifest description is empty (checked in `dist/custom-elements.json`): c-accordion, c-badge, c-card, c-csc-logo, c-data-table, c-divider, c-icon, c-icon-button, c-list, c-login-buttons, c-login-card, c-message, c-page, c-status, c-tags.
**Why** ADR-0026 says the first paragraph of `usage.md` is the description used everywhere (IDE hover, docs intro). This is not frozen API, but c-data-table in particular ships without one.
**Proposed fix** Add `usage.md` files, starting with c-data-table.
**Migration cost** None.

### c-data-table `page-size` vs c-pagination `itemsPerPage`
**Severity** note (the fix is outside this group)
**What** `c-data-table` uses `pageSize` / `pageSizes` / `change:page-size`. `c-pagination`'s `CPaginationOptions` uses `itemsPerPage` and `pageSizes` (`c-pagination/CPagination.vue:98-105`). For value-selection fields, `itemsPerPage` already means the panel's row cap (CONTEXT.md "Peek").
**Proposed fix** Rename on the c-pagination side (`pageSize`); flag it to the auditor of that group.
**Migration cost** c-pagination users.

### CDataTableColumn — `pinned` uses physical sides while `align` uses logical ones
**Severity** note
**What** `CDataTable.vue:333` `pinned?: 'left' | 'right'`; `:302` `align?: 'start' | 'center' | 'end'`.
**Why** One interface mixes physical and logical directions. The glossary defines a pinned column as stuck to the left or right edge, and TanStack uses the same words, so this is defensible. It is still the last chance to choose `start`/`end`.
**Proposed fix** Keep it, or switch to `start`/`end` for RTL safety.
**Migration cost** Alpha only.

### Glossary gaps
**Severity** note
**What** c-badge, c-status and c-message have no CONTEXT.md entry. The overlaps the brief asked about are not real:
- c-status (inline status pill) vs c-badge (count bubble pinned to its parent's corner): different roles.
- c-message (a field's hint/error line) vs c-alert (a page message): different roles.
- c-loader vs c-spinner, and c-list vs c-table: already distinguished, or clearly different.

The one real duplication is between c-badge and the `badge` props of c-icon-button and c-tag, which render their own bubbles.
**Proposed fix** Add short glossary entries for c-badge, c-status and c-message, including where each one's boundary lies.
**Migration cost** None.
