# Public-API audit before 4.0.0: overlays, navigation, tabs

Scope: c-menu c-menu-item c-menu-label c-popover c-tooltip c-modal c-toast c-toasts c-breadcrumb c-breadcrumb-item c-side-navigation c-side-navigation-item c-side-navigation-title c-sub-navigation-item c-navigation-button c-toolbar c-tabs c-tab c-tab-buttons c-tab-item c-tab-items c-pagination c-steps c-step c-link.

Paths are relative to `packages/csc-ui/src/components/` unless stated otherwise. Each claim was checked in the SFC source, the `api.snapshot.json`, and where relevant `dist/custom-elements.json` (built 2026-10-22).

These are excluded because they are already decided: the camelCase event removals, `itemChange` → `select`, the value-event triple on c-tabs/c-modal/c-pagination, and child-to-parent wiring events becoming @internal.

Totals: **11 break-now, 19 consider, 7 note** (37 findings).

Clean (no findings): c-menu-label, c-toolbar, c-breadcrumb-item, c-breadcrumb's `texts` (its key names match c-tree-select's `breadcrumb` key), and the overlay family's shared `open` / `change:open` / `trigger` / `position` / `distance` names.

---

## Break-now

### c-tab, c-tab-item, c-tab-items, c-tab-buttons — composed children publish props that only c-tabs sets
**Severity**: break-now
**What**:
- `c-tab` `active` (c-tab/CTab.vue:91): c-tabs overwrites it (c-tabs/CTabs.vue:480).
- `c-tab` `host-id` (CTab.vue:106): stamps the host's own `id`, which duplicates the native `id`. c-tabs overwrites that id anyway whenever a matching panel exists (CTabs.vue:476).
- `c-tab` `position` and `setsize` (CTab.vue:113, :120): they only stamp `aria-posinset` / `aria-setsize`, and nothing in the library sets them. `position: number` also collides with the overlay family's `position: CPlacement`.
- `c-tab-item` `active` (c-tab-item/CTabItem.vue:58): set by c-tabs (CTabs.vue:505).
- `c-tab-items` `value` and `disable-animation` (c-tab-items/CTabItems.vue:51, :44): pushed down by c-tabs (CTabs.vue:344, :685).
- `c-tab-buttons` `value` (c-tab-buttons/CTabButtons.vue:78): its own docs say "pushed down by the parent c-tabs" (CTabs.vue:348, :482).
- Defaults also disagree: `c-tab` `value` has no default, while c-tab-item, c-tab-items, c-tab-buttons and c-tabs all default to `0`.

**Why**:
- Glossary *Composed child* and *Internal event*: the parent-wiring events are already going internal, and these props are the other half of the same wiring.
- ADR-0023: c-tab-buttons "survives only as the tab-strip adapter". The glossary entry for *Tab buttons* calls standalone value-picking "Stencil-era usage". A public `value` keeps that standalone surface in the manifest and the React wrapper.
- Once frozen at 4.0, c-tabs can never change how it drives its children.

**Proposed fix**:
- Delete `host-id` (use native `id`), `position` and `setsize` from c-tab. A tablist already gives the browser the set position.
- Make c-tab `active`, c-tab-item `active`, c-tab-items `value` / `disableAnimation` and c-tab-buttons `value` internal. Use the @internal mechanism being built for events, or `_`-prefixed exposed setters, which the analyzer already hides (scripts/analyzer/script-api.mjs:284).
- Keep the public ones: c-tab `value` / `disabled`, c-tab-item `value`, c-tab-buttons `disabled` / `size`.

**Migration cost**: Low.
- Consumers who set `active` on a tab or panel already have it overwritten.
- `host-id` on c-tab becomes `id`.
- Standalone c-tab-buttons users are already a documented break (ADR-0023).
- The React wrapper regenerates.

### c-step — `current` / `complete` are parent-derived state published as props
**Severity**: break-now
**What**: `complete` and `current` (c-step/CStep.vue:89, :96). c-steps writes both on every step whenever its `value` changes (c-steps/CSteps.vue:105-106, watcher at :194), so a consumer's value is overwritten.
**Why**:
- Glossary *Custom state*: derived, otherwise-invisible state is exposed as `:state()`, not mirrored as a prop.
- The sibling c-breadcrumb-item exposes the same concept the same way: its "current" crumb is derived by the parent and published as `@cssstate current` (c-breadcrumb-item/CBreadcrumbItem.vue `:state(current)`).
- These are also composed-child props that only the parent sets.

**Proposed fix**: Remove both props. Publish `:state(current)` and `:state(complete)` through `useHostStates`, with c-steps driving them through an internal setter.
**Migration cost**: Low. Setting either prop by hand already has no lasting effect. Consumer CSS keyed on these would move to `c-step:state(current)::part(...)`.

### c-menu-item — the submenu methods meant for c-menu are public
**Severity**: break-now
**What**: `openSubmenu()`, `closeSubmenu()`, `isSubmenuOpen()` (c-menu-item/CMenuItem.vue:327-363, `defineExpose` at :363). The code comment says "exposed imperative API (called by the controlling c-menu)".
**Why**:
- Composed-child surface that only the parent should use.
- Calling them directly bypasses c-menu's open-submenu bookkeeping (c-menu/CMenu.vue `openSubmenus`).
- The library already hides methods like this with a `_` prefix: c-toasts' `_toastLeaving` and c-radio's group sync hook.

**Proposed fix**: Rename them to `_openSubmenu`, `_closeSubmenu`, `_isSubmenuOpen`. The analyzer then drops them from the manifest.
**Migration cost**: None expected.

### c-side-navigation-item, c-sub-navigation-item — `focusable` is parent wiring, with opposite defaults and a `true` default
**Severity**: break-now
**What**:
- `focusable` defaults to `true` on c-side-navigation-item (c-side-navigation-item/CSideNavigationItem.vue:171, :199) and to `false` on c-sub-navigation-item (c-sub-navigation-item/CSubNavigationItem.vue:107, :135).
- The parent item writes it on its sub-items together with `aria-hidden` (CSideNavigationItem.vue:250-255). Its own docs say "a parent item sets this to false on its collapsed sub-items".
- Both templates bind `:tabindex="focusable ? 0 : -1"` without `coerceBoolean` (CSideNavigationItem.vue:8, CSubNavigationItem.vue:6). So `focusable="false"` in markup is the truthy string `"false"`, and the item stays tabbable.

**Why**:
- Brief point 3: parent-only surface.
- Brief point 4: a boolean defaulting to `true` that markup cannot turn off.
- Brief point 2: two sibling components give the same prop opposite defaults.

**Proposed fix**: Make it internal (`_setFocusable`, or the parent stamps an internal attribute). If it has to stay public, give both components the same default and coerce it.
**Migration cost**: Negligible. It is not documented for consumers.

### c-breadcrumb, c-side-navigation-item — slots the component assigns itself are published
**Severity**: break-now
**What**:
- c-breadcrumb slots `first` and `folded` (c-breadcrumb/CBreadcrumb.vue:85-86): "Assigned by the breadcrumb… never set `slot` on a crumb", written at :264.
- c-side-navigation-item slot `sub-item` (CSideNavigationItem.vue:38): "assigned automatically", written at CSideNavigationItem.vue:233 and c-side-navigation/CSideNavigation.vue:285.

**Why**:
- ADR-0067 Consequences: "A consumer must never set `slot` on a crumb; the component owns it, as `c-side-navigation` owns its sub-items'."
- Publishing these slots freezes the slot-moving implementation. ADR-0067's rejected "mirroring" alternative, or any other fold mechanism, would then be a breaking change.
- The public styling hook already exists: `c-breadcrumb-item:state(folded)`.

**Proposed fix**: Add an internal marker for `@slot` in the analyzer, mirroring the internal-event marker; today lint.mjs:71-75 requires a tag for every template slot. Then drop these three slots from the manifest.
**Migration cost**: None for documented usage. Only CSS that selects `[slot="sub-item"]` / `[slot="folded"]` would need to change.

### c-side-navigation — the `styles` prop is an inline-style customization channel
**Severity**: break-now
**What**: `styles?: null | Record<string, string>` ("Background styles", c-side-navigation/CSideNavigation.vue:171). It is applied once on mount with `Object.assign(containerRef.value.style, props.styles)` (:295) onto the `nav` part element.
**Why**:
- ADR-0006: `::part()` is the sole consumer customization API, and per-component style props must not be reintroduced.
- Inline styles also beat `c-side-navigation::part(nav)` rules, so the prop works against the official route.
- It is not reactive either: it is applied only on mount.

**Proposed fix**: Remove it. Document `::part(nav)` / `::part(root)` and the `nav-surface` token instead.
**Migration cost**: 3.x consumers who pass `styles`. No docs example uses it.

### c-link — the `weight` prop is an inline style that blocks `::part(root)`
**Severity**: break-now
**What**: `weight?: number | string = '600'` (c-link/CLink.vue:80, :87), bound as `:style="{ fontWeight: String(weight) }"` on the `root` part (:9). The built-in default is a string `'600'`, not a number.
**Why**:
- ADR-0006, as above.
- The inline style beats any `c-link::part(root) { font-weight }`, so the documented customization route cannot change the weight.
- Glossary *Page typography*: a component pins typography in its own styles, and the consumer retypes through CSS.

**Proposed fix**: Remove `weight`. Put `font-semibold` in the `root` tv slot so `::part(root)` can override it.
**Migration cost**: 3.x consumers who use `weight`. The docs example `app/examples/c-link/basic.*` (`weight="400"`) changes to a `::part` rule.

### c-pagination — `textOverrides` is dead public API, and the UI strings are hard-coded English
**Severity**: break-now
**What**:
- `CPaginationOptions.textOverrides?: Record<string, unknown>` (c-pagination/CPagination.vue:105) is exported from the package entry but never read.
- The strings are constants: "Items per page:" (:297), "Previous page" (:299), "Next page" (:301), `` `${start} - ${end} of ${n} items` ``, `aria-label="pagination"` (:2), and `` `page ${n} of ${total}` ``.

**Why**:
- Every component that translates its UI uses a `texts` @defaultable prop with a `C<Name>Texts` type: c-breadcrumb, c-select, c-data-table, the pickers.
- An untyped `Record<string, unknown>` that does nothing is the loosest possible type (brief point 4). Once frozen, it has to stay until 5.0.

**Proposed fix**: Delete `textOverrides`. Add `texts: CPaginationTexts` with `@defaultable {}`, for example `itemsPerPage`, `previousPage`, `nextPage`, `range(start, end, total)`, `page(n, total)`, `pagination`.
**Migration cost**: None functionally, because the field never worked. TypeScript consumers who set it get a type error.

### c-side-navigation — `menu-visible` / `change:menu-visible` should be `open` / `change:open`
**Severity**: break-now
**What**:
- Prop `menuVisible` (c-side-navigation/CSideNavigation.vue:157) and event `change:menu-visible` (:67).
- The event fires only from `closeMenu` (:237), that is the close button or the backdrop.
- Opening or closing through `c-navigation-button` (:268-276) or via a nav item setting `.menuVisible = false` emits nothing, so a bound `:menu-visible` drifts out of sync.

**Why**:
- Glossary *Side navigation*: _Avoid_ "menu (the command-menu component)".
- Every sibling with an open state uses `open` plus `change:open`, fired "whenever [it] opens or closes": c-menu, c-popover, c-tooltip.
- `change:menu-visible` is already a new 4.x name (ADR-0017), so upgrading consumers are rewriting this listener anyway.

**Proposed fix**: Rename to `open` / `change:open`, and emit on every open/close transition, including the toggle from `c-navigation-button`.
**Migration cost**: Consumers who bind `menu-visible` / `menuVisible` rename one attribute and one listener, which they already touch for `change:menu-visible`.

### c-toast, c-toasts — toast parts and the close event cannot be reached through c-toasts
**Severity**: break-now
**What**:
- c-toasts renders each `<c-toast>` inside its own shadow root with no `exportparts` (c-toasts/CToasts.vue:3-8).
- So none of c-toast's 7 published parts (`root custom content item badge dismiss progress`, c-toast/CToast.vue:67-73) can be reached from consumer CSS on the normal `addToast()` path.
- c-toast's `close` event is non-bubbling (:325) and only c-toasts hears it (`@close`, CToasts.vue:8). c-toasts publishes no events, so a consumer cannot learn that a toast closed.
- c-toast's `message` prop and `closeToast()` method (:624) are parent wiring.
- c-toast/usage.md says it is "rendered and managed by c-toasts", yet the docs example `app/examples/c-toast/basic.vue` mounts a standalone `<c-toast :message>`.

**Why**:
- ADR-0006: a component that renders another in its shadow must forward its parts as `<child>-<part>`, or they are not customization API.
- ADR-0013 treats c-toast as created imperatively through `addToast`.
- As things stand, the manifest promises parts and an event that the main usage path cannot deliver.

**Proposed fix**:
1. Decide whether standalone `<c-toast>` is supported. If it is not, mark `message`, `close` and `closeToast` internal, renaming `closeToast` to `_close`.
2. Forward the curated parts from c-toasts as `toast-root`, `toast-badge`, `toast-dismiss`, `toast-progress` and so on.
3. Add a `close` event to c-toasts with `CToastMessage` as its detail. This part is additive.

**Migration cost**: Low. Today nobody can style toasts through c-toasts or hear `close`. Standalone c-toast users would be affected by step 1.

### c-side-navigation-item — the decided `select` event should not carry a raw DOM Event
**Severity**: break-now (it rides on the decided `itemChange` → `select` rename at no extra cost)
**What**: The detail is `Event`, the originating click or keydown (c-side-navigation-item/CSideNavigationItem.vue:64, :270).
**Why**: The sibling `select` on c-menu carries `{ value }` (c-menu/CMenu.vue:102). After the rename, the same event name would have two detail shapes. A DOM `Event` as a detail is also not serialisable for the React wrapper typings, and `event.target` already gives the item.
**Proposed fix**: Make the detail `void`, or `{ value }` with a new optional `value` prop on nav items, matching c-menu-item. Decide this while renaming.
**Migration cost**: None beyond the already-decided rename.

---

## Consider

### c-tabs, c-side-navigation — `mobile-breakpoint` / `mobile` name the device, not the state
**Severity**: consider
**What**:
- c-tabs `mobile-breakpoint: number = 640` (c-tabs/CTabs.vue:76). It is measured on the component's own width (ResizeObserver, CTabs.vue:580-591) and only stacks *vertical* tabs (`:host(.c-tabs--vertical.c-tabs--mobile)`, :885).
- c-side-navigation `mobile: boolean` (c-side-navigation/CSideNavigation.vue:164). It is a consumer-set switch to the slide-in drawer and is not measured at all.

**Why**:
- Glossary *Narrow viewport* _Avoid_: "Mobile (names the device, not the state)" and "breakpoint".
- The glossary grandfathers these names only for c-table, c-steps, c-login-card and c-side-navigation, and calls them "container-measured". c-tabs is not on that list.
- For c-side-navigation, the "container-measured" rationale is false.
- c-steps has no such prop (see the note on glossary drift below).

**Proposed fix**:
- c-tabs: `mobile-breakpoint` → `stack-below` (px), named for what it does.
- c-side-navigation: either rename `mobile` → a presentation name such as `slide-in`, or accept the grandfathering and fix the glossary's wording.

**Migration cost**: Every 3.x consumer who sets these attributes. This is a common pattern for c-side-navigation's `mobile`.

### c-pagination — the value object's vocabulary clashes with c-data-table and c-select
**Severity**: consider
**What**: The fields of `CPaginationOptions` (c-pagination/CPagination.vue:97-106):
- `currentPage` and `itemsPerPage`: c-data-table publishes the same concepts as `page` / `page-size` and maps between the two internally (c-data-table/CDataTable.vue:1091-1122).
- `itemsPerPage` already means "visible rows in the list" on c-select, c-autocomplete and c-tree-select (`items-per-page`, built-in default 6, the glossary's *Built-in default* example).
- The value also mixes configuration (`itemCount`, `pageSizes`, `totalVisible`) with state, and the component writes output fields (`startFrom`, `endTo`) back into the consumer's object.
- The part `items-per-page` repeats the clash.

**Why**: Brief point 2, the same concept under different names. After 4.0 this object becomes the `change` detail on a value control, so its field names freeze.
**Proposed fix**:
- Minimum: rename `currentPage` → `page` and `itemsPerPage` → `pageSize` (part `items-per-page` → `page-size`).
- Better: follow c-data-table and move `itemCount`, `pageSizes` and `totalVisible` into props, so `value` is just `{ page, pageSize }`.

**Migration cost**: High. Every c-pagination consumer uses these 3.x field names. Weigh this against freezing the clash until 5.0.

### c-pagination — `hide-details`, `hide-range` and `simple`
**Severity**: consider
**What**:
- `hide-details` (c-pagination/CPagination.vue:115) hides the items-per-page menu and the range text. On 13 form fields, `hide-details` is a @defaultable prop that hides the hint and error message, and on c-progress-bar it hides the percentage. Those are different concepts under the same name.
- `hide-range` (:122) overlaps it.
- `simple` (:129, "Hide page number buttons") does not say what it does.

**Why**: Brief point 2: one name for two concepts across the library, and an app default for the form fields' `hideDetails` reads naturally as if it should apply here too.
**Proposed fix**: `hide-details` → `hide-page-size`, `simple` → `hide-pages`. Keep `hide-range`.
**Migration cost**: 3.x consumers who use these switches.

### c-toasts — `vertical` / `horizontal` / `absolute` diverge from the overlays' placement vocabulary
**Severity**: consider
**What**:
- `vertical: 'bottom' | 'top'` and `horizontal: 'center' | 'left' | 'right'` (c-toasts/CToasts.vue:19-47) use physical `left` / `right`.
- The overlays use one `position` prop with logical `-start` / `-end` (`CPlacement`), and c-tabs' `justify` is logical too.
- `vertical` is a boolean orientation on c-tabs and c-divider, so the same name carries two types.
- `absolute` names the CSS keyword. The glossary *Static* entry says toolbar placement is "named for the behaviour, not the CSS keyword", and the 3.x `relative` switch was retired for that reason.

**Why**: Brief point 2.
**Proposed fix**: Replace them with `position: CToastsPosition` (`'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'`, default `'bottom'`). Rename `absolute` → `contained`.
**Migration cost**: 3.x consumers who set these attributes. The `CToastsHorizontal` / `CToastsVertical` type exports go away.

### CToastMessage (shared type) — `title` should be `heading`
**Severity**: consider
**What**: `CToastMessage.title?: string`, "Optional title rendered above the message" (src/types.ts:83), rendered at c-toast/CToast.vue:21. The type is exported from the package entry.
**Why**: Glossary *Heading*: the visible caption naming a component's content region is called `heading`, with _Avoid_ "Title". Siblings use `heading`: c-alert, c-popover, c-accordion-item.
**Proposed fix**: `heading`. Optionally add a `toast-heading` part when parts are forwarded (see the break-now c-toast finding).
**Migration cost**: Every `addToast({ title })` call site. Moderate, and compile-checked for TypeScript users.

### c-modal — `dismissable`, `dismissible` and `closeable` spell one concept three ways
**Severity**: consider
**What**:
- c-modal `dismissable` (c-modal/CModal.vue:141).
- c-alert `dismissible` (c-alert/CAlert.vue:44, outside this group).
- c-tag `closeable` (c-tag/CTag.vue:38).
- The glossary itself writes "dismissible" (CONTEXT.md:269) and "dismissable" (:325, :379).

**Why**: A consumer who types `dismissible` on c-modal gets a silent no-op. Brief point 2.
**Proposed fix**: Choose one spelling library-wide, then change c-modal or c-alert and update the glossary. "dismissible" is the common dictionary form. The glossary's `closable` _Avoid_ also covers c-tag's `closeable`.
**Migration cost**: Users of whichever tag is renamed (c-modal's is the 3.x name).

### c-side-navigation-item — `active` means both "current page" and "expanded"
**Severity**: consider
**What**:
- On a leaf item, `active` (CSideNavigationItem.vue:168) is the current page.
- On an item with sub-items it drives expansion: `:aria-expanded="!!active"` (:22), the `h-max` sub-nav, and the rotated chevron.
- c-side-navigation toggles it as an accordion (c-side-navigation/CSideNavigation.vue:242-260).
- The docs example expands "Projects" with `active`.

**Why**: The glossary *Active* is the selected or pressed look. Expansion is a separate concept, and the sibling c-accordion-item names it `expanded`. A parent cannot be shown as expanded without also looking active, or the other way round.
**Proposed fix**: Add `expanded` to items that have sub-items, and keep `active` for the current page.
**Migration cost**: Consumers who expand parents through `active`.

### c-sub-navigation-item — no activation event, and navigation cannot be intercepted
**Severity**: consider
**What**:
- Activation does `window.location.href = props.href` or `window.open` (c-sub-navigation-item/CSubNavigationItem.vue:149-163) after `stopPropagation()`, and emits nothing.
- The sibling c-side-navigation-item emits an activation event, which becomes `select`.
- The docs example has to use `@click` plus `@keyup.enter` on sub-items (`app/examples/c-side-navigation/basic.vue:22-31`).

**Why**: Brief point 2. The decided `select` on c-side-navigation will not fire for sub-items, and a single-page app cannot route a sub-item. c-breadcrumb-item renders a real `<a>`, and its docs show `@click.prevent` routing.
**Proposed fix**: Emit the same `select` (bubbling and composed) as c-side-navigation-item, and render an `<a href>` so `preventDefault()` routes. Adding the event is additive; changing the navigation is behavioural.
**Migration cost**: None for adding the event.

### c-menu-item — `icon` is an icon-path prop where siblings use an `icon` slot
**Severity**: consider
**What**: `icon?: string` (an SVG icon path) and `activeIcon?: string` (c-menu-item/CMenuItem.vue:186, :199).
**Why**: Every sibling with a leading icon takes an `icon` *slot* that holds a `c-icon`: c-button, c-breadcrumb-item and c-accordion-item. c-menu-item is the only component with an icon prop. Glossary *Path*: say "icon path", and the prop name hides that it is one.
**Proposed fix**: Replace `icon` with an `icon` slot. Either keep `active-icon` as `active-icon-path` or drop it in favour of `::part(check)`.
**Migration cost**: Consumers who set `icon=` on menu items.

### c-menu-item — `active` is a three-state boolean
**Severity**: consider
**What**:
- `active?: boolean` with a deliberate `undefined` default (CMenuItem.vue:178, :214).
- When the attribute is absent, the item is a plain `menuitem`. With `"false"` it is an unchecked `menuitemradio`, and with presence it is checked.
- The snapshot shows only `"active": "boolean"`.

**Why**: Brief point 4. Under HTML boolean-attribute semantics, absent and `false` mean the same thing. Here markup needs `active="false"`, and a React `active={false}` versus omitted behave differently.
**Proposed fix**: Add an explicit `checkable` boolean, or a `type: 'command' | 'radio'` union, and make `active` a plain two-state boolean.
**Migration cost**: Consumers of checkable menu items (low).

### c-menu-item — part `submenu` breaks the panel/list naming of its siblings
**Severity**: consider
**What**: c-menu-item exposes `submenu-panel` (the popover) and `submenu` (the list surface) (CMenuItem.vue:68-69).
**Why**: The same anatomy is named `panel` / `list` on c-menu (c-menu/CMenu.vue:57-58) and `panel` / `panel-list` on c-breadcrumb. Brief point 2.
**Proposed fix**: Rename `submenu` → `submenu-list`, and update c-menu/usage.md and c-menu-item/usage.md (`::part(submenu)`).
**Migration cost**: Consumers who restyle submenu lists, for example to restore the scrollbar.

### c-side-navigation-title — part `label` holds a heading
**Severity**: consider
**What**: Part `label`, "The uppercase section title label" (c-side-navigation-title/CSideNavigationTitle.vue:3, :21).
**Why**: Glossary *Label* is a form control's wired name, with _Avoid_ "heading". The closest sibling, c-card-title (also a `*-title` tag), names the same region `heading`, and so do c-popover and c-alert.
**Proposed fix**: Rename the part to `heading`.
**Migration cost**: Consumers who restyle side-navigation section titles.

### c-menu, c-popover, c-tooltip, c-steps — numeric props typed `number | string`
**Severity**: consider
**What**:
- `distance` (c-menu/CMenu.vue:140, c-popover/CPopover.vue:52, c-tooltip/CTooltip.vue:65).
- `delay` (CTooltip.vue:62).
- c-steps `value` (c-steps/CSteps.vue:68).

All of them are only ever used as `Number(...)` or `+value`.

**Why**: Brief point 4. The type is wider than the behaviour. Vue casts attributes to a number only for props whose runtime type is exactly Number, so with `number | string` every attribute arrives as a string. c-modal's `width: number | string` is legitimate (it accepts CSS lengths) and is not included here.
**Proposed fix**: Narrow these to `number`.
**Migration cost**: TypeScript or property-binding consumers who pass strings. Markup is unaffected.

### c-tooltip — content goes in a named `content` slot, where c-popover uses the default slot
**Severity**: consider
**What**: c-tooltip has slots `content` and `trigger`, and no default slot (c-tooltip/CTooltip.vue:49, :95). c-popover's content is its default slot (c-popover/CPopover.vue:83).
**Why**: Brief point 2: the two anchored overlays put their surface content in different places.
**Proposed fix**: Make tooltip content the default slot, with `text` as the fallback.
**Migration cost**: Consumers who use `slot="content"` on tooltips.

### c-menu — the `select` detail `{ value: unknown }` is looser than the behaviour
**Severity**: consider
**What**: `select: { value: unknown }` (c-menu/CMenu.vue:102). The value comes from c-menu-item's `value?: string` (CMenuItem.vue:206) or its attribute.
**Why**: Brief point 4. Every consumer has to cast. c-pagination itself does `Number(detail.value)`.
**Proposed fix**: `{ value: string | undefined }`.
**Migration cost**: None at runtime. A narrower output type only loosens consumer code.

### CPlacement (shared type) — not shared under the glossary rule, and named differently from its prop
**Severity**: consider
**What**: `CPlacement` (src/types.ts:23) types `position` on c-menu, c-popover and c-tooltip.
**Why**:
- Glossary *Shared type*: a value that never crosses a component boundary stays component-owned; "two components declaring the same union is heritage, not contract".
- The type is also named "placement" while every prop using it is named `position`. Glossary *Component-owned type* names types `C<Component><Concept>`.

**Proposed fix**: Either `CMenuPosition`, `CPopoverPosition` and `CTooltipPosition`, or keep one shared type, rename it `CPosition`, and write down why it counts as shared.
**Migration cost**: Type-only imports of `CPlacement`.

### c-side-navigation — the `autoheight` host-class API is outside the manifest
**Severity**: consider
**What**:
- c-side-navigation/usage.md:17 documents "The `autoheight` host class".
- The migration guide (`csc-ui-documentation/app/content/migration.ts:484`) says "it stays for standalone use".
- It is implemented as `:host(.autoheight)` (c-side-navigation/CSideNavigation.vue:339).
- It is not in the snapshot.

**Why**: Brief point 5: documented API missing from the manifest. The sibling c-toolbar retired its 3.x host-class switch (`relative`) for a `static` prop.
**Proposed fix**: Make it a boolean prop named for the behaviour, for example `fill-viewport`, or drop it.
**Migration cost**: Standalone shells that use `class="autoheight"`.

### c-side-navigation, c-sub-navigation-item, c-toast, c-tabs, c-tab-buttons, c-steps, c-navigation-button — fixed English UI strings with no `texts`
**Severity**: consider
**What**:
- "Close sidemenu" (c-side-navigation/CSideNavigation.vue:5).
- ", Current page" (c-sub-navigation-item/CSubNavigationItem.vue:15).
- `aria-label="close"`, unless the per-message `closeText` is set (c-toast/CToast.vue:27).
- "Scroll tabs back" / "Scroll tabs forward" (c-tab-buttons/CTabButtons.vue:243-244).
- The c-tabs overflow arrows have no label at all (c-tabs template).
- The c-steps screen-reader summary (c-steps/CSteps.vue:135).
- c-navigation-button's inner icon button has no name, and `inheritAttrs: false` drops a host `aria-label`, so there is no public way to name it.

**Why**: The library's localisation contract is the @defaultable `texts` prop (c-breadcrumb, c-select, the pickers). Adding `texts` later is additive. `CToastMessage.closeText`, however, is a per-message alternative that would freeze beside a future `c-toasts` `texts.close`.
**Proposed fix**: Before 4.0, decide whether `closeText` stays. Add `texts` to these components when convenient. c-navigation-button at least needs a name.
**Migration cost**: None (additive), unless `closeText` is removed.

### c-pagination — leaks its internal menu's `select` event
**Severity**: consider
**What**: The page-size `c-menu` inside c-pagination's shadow root emits `select` with `{ bubbles: true, composed: true }` (c-menu/CMenu.vue:617). `onPageSizeSelect` (c-pagination/CPagination.vue:360) does not stop it.
**Why**: Brief point 5. c-pagination, and through it c-data-table, emits an undeclared `select` that consumers' menu listeners on any ancestor will hear.
**Proposed fix**: Call `stopPropagation()` in `onPageSizeSelect`.
**Migration cost**: None.

---

## Note

### c-menu, c-pagination, c-steps — wrong or placeholder manifest descriptions
**Severity**: note
**What**:
- c-menu default slot: "Menu title / activator element (simple variant)" (c-menu/CMenu.vue:53). It actually holds the items, and "activator" is on the glossary *Trigger* _Avoid_ list.
- c-pagination `size`: "Hide details (per page dropdown…)", copied from `hideDetails` (CPagination.vue:132).
- c-steps `value`: "Value of the accordion" (CSteps.vue:64).
- Many props in the group still carry `@seeded from csc-ui — verify`.

**Proposed fix**: Rewrite these before the docs freeze.

### c-tabs, c-pagination, c-steps, c-navigation-button — standalone tags without a usage.md
**Severity**: note
**What**: These four have no usage.md, so the manifest description is empty (checked in `dist/custom-elements.json`). The analyzer only warns (scripts/analyzer/lint.mjs:193).
**Why**: ADR-0026: the component description is usage.md's first paragraph. It drives IDE hover text and the docs intro.

### c-popover — no `heading` slot
**Severity**: note
**What**: c-popover has a `heading` prop and part but no slot.
**Why**: Glossary *Heading*: "accept it under the name `heading`, prop and slot alike". c-alert has both. Adding the slot is additive.

### c-steps — glossary drift and `value` on a non-value control
**Severity**: note
**What**:
- Glossary *Narrow viewport* lists c-steps as having container-measured `mobile` / `mobileBreakpoint` switches. It has neither; it switches automatically. The glossary omits c-tabs, which does have one.
- c-steps holds `value` but has no value events and is not in the glossary's *Value control* list.

**Proposed fix**: Correct the glossary. Keeping `value` (the 3.x name) is acceptable, but its docs should state that c-steps is display-only.

### c-menu, c-modal, c-side-navigation, c-tab, c-steps, c-link and others — inconsistent `C<Name>Props` exports
**Severity**: note
**What**: The entry exports `CPopoverProps`, `CTooltipProps`, `CTabsProps`, `CTabButtonsProps`, `CPaginationProps`, `CToastProps`, `CToastsProps` and `CBreadcrumbItemProps`. It does not export `CMenuProps`, `CModalProps`, `CSideNavigationProps`, `CTabProps`, `CStepsProps` or `CLinkProps`. Library-wide, 29 of 79 tags export one.
**Why**: Whether a Props type is exported depends on whether the interface sits in a non-setup `<script>`, not on any policy.
**Proposed fix**: Decide "all or none" before 4.0. Exporting more later is additive; removing is not.

### c-toasts — `addToast` returns nothing, so auto-generated ids cannot be passed to `removeToast`
**Severity**: note
**What**: `addToast(message)` returns void (CToasts.vue:208). `removeToast(id)` (:250) needs an id, which the consumer must invent themselves.
**Proposed fix**: Return the id. This is additive.

### c-tabs — the underlined row's scroll arrows have no parts
**Severity**: note
**What**: c-tab-buttons exposes `scroll-back` / `scroll-forward` parts. The equivalent c-tabs arrows (c-tabs/CTabs.vue template, two `c-icon-button`s) have no part and no label.
**Proposed fix**: Add the same two part names. This is additive.
