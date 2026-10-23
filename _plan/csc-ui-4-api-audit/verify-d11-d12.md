# Verification of D11 + D12 (`_plan/csc-ui-4-stable-release.md`)

Checked against source at HEAD `67a3e096`. 3.x checked on `origin/legacy-main`. Paths are relative to `packages/csc-ui/src/components/` unless stated otherwise. MyCSC usage is unknown throughout.

**Counts:** 31 CONFIRMED · 2 ALREADY-COVERED · 1 CONTRADICTS-DOCS · 0 WRONG-CLAIM · 16 NEEDS-CALL (50 items).

No plan claim is false in the source. Several of the audit's migration-cost claims behind these items are wrong, though: `textOverrides` "never worked", `updateMobileLabels` is "a 4.x addition", and `host-name`/`aria-label-internal` are "3.x names". The details are under each item.

| # | Item | Verdict | One-line reason |
|---|------|---------|-----------------|
| 1 | D11 `valid` → `invalid` on 14 tags + migration entry | NEEDS-CALL | The claim is true, and ADR-0076 accepts the break. But this is the most-used 3.x prop, the plan's own D13 rule sends widely used 3.x names down add + deprecate, and a missed rename fails silently. |
| 2 | D11 c-loader `visible` → `hidden` | NEEDS-CALL | `hidden` is a global attribute and the `HTMLElement.hidden` member. The 3.x name was `hide` (default false), which the audit recommended and ADR-0076 never weighed. |
| 3 | D11 c-loader: drop `show()`/`hide()` | CONFIRMED | Alpha-only methods (`c-loader/CLoader.vue:186`). 3.x c-loader had no `@Method`. |
| 4 | D11 c-side-navigation-item `focusable` → internal | CONFIRMED | Default `true` (`CSideNavigationItem.vue:199`). Only a parent item writes it, on `[slot="sub-item"]` children (`:250-255`). The prop did not exist on this tag in 3.x. |
| 5 | (gap) c-sub-navigation-item `focusable` | NEEDS-CALL | Same parent wiring, and the main target of `:250-255`. It has the opposite default `false` (`CSubNavigationItem.vue:107/135`) and was public in 3.x. The plan leaves it public. |
| 6 | D11 strict rule: no boolean with a `true` built-in default | CONFIRMED | Today only `valid` ×13, `visible` and `focusable` trip it. Scope it to the type `boolean`: c-checkbox/c-switch `true-value` is `boolean \| number \| string = true`. |
| 7 | Tag-level `@internal` (c-dropdown, c-input), one generated list, no `CInput` in React | ALREADY-COVERED | Landed in HEAD `67a3e096`, along with `@internal` props/events and `@internalslot`. |
| 8 | c-tab `active` → internal | CONFIRMED | c-tabs overwrites it (`c-tabs/CTabs.vue:480`). 3.x c-tabs did too. |
| 9 | c-tab-item `active` → internal | CONFIRMED | Overwritten at `CTabs.vue:505`. |
| 10 | c-tab-items `value` / `disableAnimation` → internal | CONFIRMED | Pushed down at `CTabs.vue:344` and `:685`. 3.x did the same. |
| 11 | c-tab-buttons `value` → internal (standalone API retires) | ALREADY-COVERED | ADR-0023 retired standalone use, and `migration.ts` already maps it to c-button-group. |
| 12 | Plan wording "c-tab/-item/-items/-buttons `active`/`value`/…" | NEEDS-CALL | c-tab `value` and c-tab-item `value` are consumer identity, used in every tabs canon, and must stay public. Spell out the list. |
| 13 | c-step `current`/`complete` → internal | CONFIRMED | c-steps writes both (`c-steps/CSteps.vue:105-106`), as 3.x did. A `:state(current)` hook can be added later as a non-breaking addition. |
| 14 | c-list-item `disabled-by-parent` → internal | CONFIRMED | Only c-list writes it (`c-list/CList.vue:101-106`). |
| 15 | Delete c-tab `host-id` | CONFIRMED | In 3.x this prop was the native `id` attribute (`@Prop({ attribute: 'id' }) hostId`), so 3.x markup is unaffected. c-tabs overwrites the id anyway (`CTabs.vue:476`). |
| 16 | Delete c-tab `position` / `setsize` | CONFIRMED | They only stamp aria-setsize/posinset (`c-tab/CTab.vue:162,165`). Nothing in 4.x sets them. |
| 17 | c-menu-item submenu methods → `_`-prefixed | CONFIRMED | Only c-menu calls them (`c-menu/CMenu.vue:222,521,537`). c-menu-item is 4.x-only. |
| 18 | c-breadcrumb slots `first`/`folded` → internal slots | CONFIRMED | ADR-0067 Consequences: "the component owns it". The marker already exists. |
| 19 | c-side-navigation-item slot `sub-item` → internal slot | CONFIRMED | Assigned at `CSideNavigationItem.vue:233` and `CSideNavigation.vue:285`. No usage.md mentions it. |
| 20 | Drop `migratedTags` / `tailwindVariantTags` from `src/index.ts` | CONFIRMED | Required by ADR-0074 Consequences. Only the conformance specs and `test/dist-smoke.spec.ts` use them. |
| 21 | c-toasts forwards c-toast parts as `toast-*` | CONFIRMED | There is no `exportparts` (`c-toasts/CToasts.vue:3-8`). Matches ADR-0006's `<child>-<part>` rule. |
| 22 | c-toasts emits `close` | CONFIRMED | A non-breaking addition. c-toast's `close` does not bubble (`c-toast/CToast.vue:325`), so consumers cannot hear it today. |
| 23 | Decide standalone c-toast support | NEEDS-CALL | Left open by the plan. Recommendation: tag-level internal. |
| 24 | c-otp-input: one value shape | NEEDS-CALL | The claim is true, but the plan never names the shape, and either choice changes 3.x v-model semantics. |
| 25 | c-otp-input `completion` typed `string` | CONFIRMED | It fires only when the code is full (`c-otp-input/COtpInput.vue:320`). 3.x declared it `EventEmitter<string>`. |
| 26 | c-radio `change` stops at c-radio-group | CONFIRMED | Already decided in ADR-0075 Consequences. Also delete `c-radio-group/usage.md:41-43`. See the implementation note in "Other findings". |
| 27 | c-pagination: delete `textOverrides`, add `texts: CPaginationTexts` | NEEDS-CALL | Dead in 4.x, but it worked in 3.x, so this is a 3.x regression that needs a migration entry. The key names are unnamed, and c-data-table's embedded pagination needs a route. |
| 28 | c-table `updateMobileLabels()` into the manifest | CONTRADICTS-DOCS | The glossary grandfathers "mobile" only as prop names. The method is a 3.x `@Method`, so keep the name and widen the glossary. |
| 29 | Remove `reset()` from c-select / c-autocomplete | CONFIRMED | It emits value events programmatically, against the glossary's Value control entry (`CONTEXT.md:748`). It was a 3.x `@Method`, so it needs a migration entry. |
| 30 | c-slider numeric props typed `number` | CONFIRMED | Today `number \| string` with string defaults (`c-slider/CSlider.vue:222-282`). Note that the emitted detail becomes always a number. |
| 31 | c-slider: delete `aria-label-internal` | NEEDS-CALL | The 3.x attribute was `aria-label`. Deleting it leaves no way to name a slider that has no visible label. |
| 32 | Delete c-message `input-id` | CONFIRMED | Never read (`c-message/CMessage.vue:81,94`). Also drop the binding at `c-otp-input/COtpInput.vue:61`. |
| 33 | Delete c-color-picker `separator` part | CONFIRMED | TypedField renders it only under `range` (`src/shared/TypedField.vue:51-55`), and the colour picker has no range. |
| 34 | `target` default `''` on c-button + c-list-item | NEEDS-CALL | A silent change to 3.x behaviour (both defaulted to `_blank` in 3.x). c-button's keyboard path still calls `window.open(href, '')`, which opens a new tab. |
| 35 | c-side-navigation-item `select` detail "typed like c-menu's" | NEEDS-CALL | Contradicts the plan's own D4 ("detail = originating event"). The shape is unnamed. |
| 36 | c-alert `dismissible` → `closeable` | CONFIRMED | Glossary Closeable (`CONTEXT.md:382-384`) already lists c-alert and avoids "Dismissible (the alert's former prop)". Alpha-only; 3.x c-alert had only `type`. |
| 37 | c-alert event `dismiss` → `close` | CONFIRMED | Same entry: closeable components fire `close`. Alpha-only. |
| 38 | c-accordion-item slot `header` → `heading` | NEEDS-CALL | Matches the glossary, but it is a 3.x slot used in a docs canon. A leftover `slot="header"` matches no slot, so the custom heading silently disappears. |
| 39 | `CToastMessage.title` → `heading` | NEEDS-CALL | Matches the glossary, but `title` is a 3.x field. An untyped `addToast({ title })` silently loses the heading. |
| 40 | c-select part `menu` → `panel` | NEEDS-CALL | The name is right, but the single `<dialog>` plays both the siblings' `panel` and their styled `card`. |
| 41 | c-checkbox `label`/`content` parts per ADR-0022 | NEEDS-CALL | The claim is true, but the row's new part name is unnamed. |
| 42 | c-color-picker `color-chip` part "renamed" | NEEDS-CALL | No target is named. Proposal: `value-color`. |
| 43 | c-side-navigation `menu-visible` → `open` | CONFIRMED | The glossary's Side navigation entry avoids "menu", and every overlay uses `open`. It is a 3.x prop (3.x had no event), with low expected use. |
| 44 | `change:menu-visible` → `change:open`, also on c-navigation-button toggle | CONFIRMED | Today it fires only from `closeMenu` (`CSideNavigation.vue:237`). The document toggle (`:274/276`) and the items' `.menuVisible = false` emit nothing. |
| 45 | `host-name` → `name` (c-checkbox, c-slider) | CONFIRMED | This restores the 3.x attribute (`@Prop({ attribute: 'name' }) hostName` on both). Only 3.x property users change. |
| 46 | c-data-table texts `selectAllItems` → `selectAllRows` | CONFIRMED | The glossary reserves "item" for `items` entries (`CONTEXT.md:604`). The key is 4.x-only and appears in no canon. |
| 47 | `CAlertIconType` "renamed" | NEEDS-CALL | No target is named. Recommendation: stop exporting it. |
| 48 | c-loader `contentdelay` → `content-delay`, in ms | CONFIRMED | 3.x name. A leftover `contentdelay` is ignored, so the message shows with no delay (harmless). The migration entry must say "×1000". |
| 49 | Remove c-side-navigation `styles` | CONFIRMED | It is an inline-style channel (`CSideNavigation.vue:171,294`), against ADR-0006. 3.x prop; no canon uses it. |
| 50 | Remove c-link `weight` | CONFIRMED | Its inline style beats `::part(root)` (`c-link/CLink.vue:9`). 3.x prop. `app/examples/c-link/basic.*` (all four flavours) set `weight="400"` and must be rewritten as a `::part` rule. |

---

## Non-CONFIRMED items

### 1. `valid` → `invalid` — NEEDS-CALL
**Evidence**
- 13 snapshots have `"valid": "boolean = true"`. The 14th tag is the now-internal c-input, which reads `!props.valid` at `c-input/CInput.vue:446,458` (the plan says `:444`; HEAD's docblock moved it by two lines).
- Only c-radio-group (`:209`) and c-file-upload (`:746`) coerce the value.
- In 3.x, `@Prop() valid = true` was on 9 tags: autocomplete, checkbox, input, message, otp-input, radio-group, select, text-field, text-field-open.
- Current users:
  - usage.md snippets: c-text-field:94, c-number-field:68, c-date-picker:50, c-time-picker:56, c-color-picker:52.
  - The c-message canon, in all four flavours.

**The decision the plan glosses over**
- ADR-0076 accepts breaking now. Its only considered alternative is keeping `valid` public with coercion.
- But the plan's own D13 rule sends "3.x-era names in wide use" down add + deprecate. That is why `hide-details` → `hide-message` goes there.
- `valid` is the most widely used 3.x prop of all, and its failure mode is silent. A leftover `:valid="!error"` is no longer a prop, so it becomes a plain attribute and the field never shows its error.

**Recommendation**
- Keep ADR-0076's break: it keeps the frozen API clean.
- Make a leftover `valid` loud: a one-time dev-mode `console.warn` when a field host has a `valid` attribute or property. D13 already plans dev warnings that specs consume through `consoleSpy.expect`.
- Say "silent if missed" in the migration entry.
- Update the `valid` mentions at `CONTEXT.md:407` (Custom state) and `docs/adr/0035…md:56`.
- If you would rather follow D13's rule, the alternative is add `invalid` + a coerced `@deprecated` `valid` until 5.0. That needs the deprecation mechanism before rc.1, an exemption in the strict rule, and an amendment to ADR-0076.

### 2. c-loader `visible` → `hidden` — NEEDS-CALL
**Evidence**
- 3.x had `@Prop() hide = false` (`legacy-main c-loader.tsx:22`). The 4.x prop's own docblock says it "replaces the original Stencil `hide` prop" (`CLoader.vue:121-123`).
- The audit recommended restoring `hide`. ADR-0076 names `hidden` without weighing `hide`.

**Problems with `hidden`**
- `HTMLElement.hidden` is `boolean | "until-found"` (typescript 6.0.3 `lib.dom.d.ts:17771`). An optional `hidden?: boolean` fails `@lit/react`'s `I extends HTMLElement` constraint exactly as `autocorrect` does (`packages/csc-ui-react/scripts/generate.mjs` `DOM_LIB_COLLISIONS`), so it needs a new collision entry, and it narrows away `"until-found"`.
- The shared `:host { display: contents }` (`src/tailwind.css:208-209`) is author-origin CSS, so it beats the UA rule `[hidden] { display: none }`. As a result `hidden` hides nothing on every other `c-*` host. On c-loader it would mean "hide", which gives the global attribute two meanings across the library.
- A later library-wide `:host([hidden]) { display: none }` fix would cut c-loader's fade-out.

**Recommendation**
- Use `hide` (default `false`), named for the non-default state as ADR-0076 requires. 3.x markup then works unchanged; only alpha `visible` users migrate.
- Amend ADR-0076's Decision line.
- Either way, flip the internal users: `CSideNavigationItem.vue:31` and `CSubNavigationItem.vue:18` bind `:visible="loading"`.

### 5. c-sub-navigation-item `focusable` — NEEDS-CALL (gap)
**Evidence**
- `handleChildFocusableChange` writes `.focusable` onto every `[slot="sub-item"]` child (`CSideNavigationItem.vue:250-255`). c-side-navigation assigns that slot to `c-sub-navigation-item` (`CSideNavigation.vue:285`), so the sub-navigation item is the main target of this wiring.
- c-sub-navigation-item has `focusable` with a `false` default (`CSubNavigationItem.vue:107,135`). It reads it without coercion (`:6`). 3.x had `@Prop() focusable = false` on this tag.

**Recommendation**
- Make it internal in the same PR as #4.
- Give both items one `@internal` prop that defaults to `false`, named for the non-default state (for example `collapsed`, set by the parent), so ADR-0076's "every boolean defaults to false" holds for internal props too. Avoid `inert`/`hidden`, which are global attributes.
- One side effect: a sub-navigation item placed outside a parent item becomes Tab-reachable. That looks like a fix.

### 7. Tag-level `@internal` — ALREADY-COVERED
**What covers it:** HEAD `67a3e096` "Keep internal tags and members out of the public API".
- c-input and c-dropdown are marked `@internal`.
- `csc.internalTags` is read by `app/composables/useManifest.ts`, `scripts/check-example-parity.mjs` and the React `generate.mjs`.
- `CInput` is gone from `csc-ui-react/src/components.ts`.
- The analyzer also honours `@internal` on props and events, and `@internalslot`.

That leaves items 8–19 as tagging work only.

**Note:** its changeset `.changeset/internal-tags.md` is `minor`, yet it removes `CInput`, `CInputElement` and `CDropdownElement`. That is breaking under ADR-0074, and the plan says breaking items carry `major` in pre mode.

### 11. c-tab-buttons `value` → internal — ALREADY-COVERED
**What covers it**
- ADR-0023 Decision: "Standalone `c-tab-buttons` is a **documented upgrade break**".
- `app/content/migration.ts:434-452` already maps standalone `<c-tab-buttons value=…>` to `<c-button-group>`.
- Inside c-tabs, `value` is pushed down anyway (`CTabs.vue:348,482`).

No new migration step is needed.

### 12. Plan wording for the tab family — NEEDS-CALL
**Problem:** "c-tab/-item/-items/-buttons `active`/`value`/`disableAnimation`" reads as if `value` goes internal on all four tags. c-tab `value` and c-tab-item `value` are how consumers pair tabs with panels: every canon (`app/examples/c-tab*/basic.*`, `c-tabs/*`) sets them, and `CTabs.vue:467` matches on them.

**Recommendation:** write the list out.
- Internal: c-tab `active`; c-tab-item `active`; c-tab-items `value`, `disableAnimation`; c-tab-buttons `value`.
- Public: c-tab `value`/`disabled`; c-tab-item `value`; c-tab-buttons `disabled`/`size`.

### 23. Standalone c-toast — NEEDS-CALL
**Evidence**
- c-toasts renders `<c-toast>` in its own shadow root (`CToasts.vue:3-8`) and declares `@subcomponents c-toast` (`:55`).
- c-toast/usage.md: "rendered and managed by c-toasts". But `app/examples/c-toast/basic.*` mounts a standalone `<c-toast :message>`.
- ADR-0013:35-36 defines internal-only as "instantiated by a parent's own implementation and never authored by a consumer", and says c-toast folds into c-toasts "(toasts are created imperatively via `addToast`), rather than … staying standalone".
- Glossary Composed child (`CONTEXT.md:713-715`) is something "the consumer authors … inside a specific parent's markup", which c-toast is not.

**Recommendation:** mark c-toast as tag-level `@internal`.
- This drops `message`, `close`, `closeToast`, the `CToastProps` export and the React `CToast`.
- Remove `@subcomponents c-toast` (the lint rejects an internal subcomponent) and the standalone canon.
- The `toast-*` forwarding (#21) then becomes the only styling route, so forward all seven parts.
- `closeToast` was a 3.x `@Method`. Mention it in the migration guide; the 4.x replacement is `removeToast(id)`.

### 24. c-otp-input value shape — NEEDS-CALL
**Evidence**
- `update:value` carries the partial digits (`COtpInput.vue:318`).
- The host `value` is set to `null` until the code is full (`:316,327`), so Vue v-model sees `null`.
- The `value` prop is typed `string = ''` (`:232,245`).
- 3.x emitted `changeValue(isFullyFilled ? value : null)`, so 3.x v-control users relied on null-until-complete.

**Missing decision:** the plan says "one value shape" but never says which.

**Recommendation**
- Use the digits typed so far, `''` when empty, for the prop, `update:value`, the host property and D3's `change`. This matches native input timing (ADR-0075) and the declared type.
- Completeness is signalled by `completion` (#25) or by `value.length === length`.
- Migration entry: "v-model now holds partial digits, not `null` until complete."

### 27. c-pagination `textOverrides` → `texts` — NEEDS-CALL
**Evidence**
- `CPaginationOptions.textOverrides?: Record<string, unknown>` (`c-pagination/CPagination.vue:105`) is never read in 4.x.
- In 3.x it was a typed, working translation API. `CPaginationTextOverrides` had `itemsPerPageText`, `nextPage`, `prevPage`, `pageText({ start, end, count })` and `pageOfText({ pageNumber, count })` (`legacy-main src/types/index.ts`), read by `_getText` in `legacy-main c-pagination.tsx:106-110`.
- So the audit's "None functionally, because the field never worked" is false for 3.x upgraders, who silently lost their translations in 4.x.
- `migration.ts` says nothing about it.
- c-data-table renders its own `<c-pagination>` in its shadow (`c-data-table/CDataTable.vue:257`), and `CDataTableTexts` has no pagination keys.

**Recommendation: name the keys now, positional like the other `texts` functions.**

| 3.x key | 4.x key |
|---|---|
| `itemsPerPageText` | `pageSize` (matches D13's coming `pageSize` vocabulary) |
| `prevPage` | `previousPage` |
| `nextPage` | `nextPage` |
| `pageText` | `range(start, end, count)` |
| `pageOfText` | `page(n, total)` |
| (new) | `pagination`, the landmark label |

Also:
- Put the 3.x → 4.x mapping in the migration guide.
- Add c-pagination to the `appDefaults.spec.ts` pinned list.
- Decide c-data-table's route. Either add `CDataTableTexts.pagination?: CPaginationTexts`, or document that `applyDefaults({ 'c-pagination': { texts } })` reaches the embedded pagination; that route works only app-wide, not per instance.

### 28. c-table `updateMobileLabels()` — CONTRADICTS-DOCS
**Conflict:** `CONTEXT.md:359-360`, Narrow viewport: "…the container-measured `mobile` / `mobileBreakpoint` switches of `c-table`, … keep their grandfathered names. _Avoid_: Mobile (names the device, not the state; grandfathered only as those prop names)". Publishing `updateMobileLabels()` freezes a "mobile" name that is not a prop.

**Evidence**
- The method is attached by hand (`c-table/CTable.vue:150-151`). The snapshot has `"methods": {}`.
- It is a 3.x `@Method` (`legacy-main c-table.tsx:32`), and so are `no-mobile-labels` (`:47`) and `c-table__mobile-label`. The audit's "probably 4.x additions" is wrong.

**Recommendation**
- Keep the 3.x name, since renaming breaks 3.x code for no gain, and expose it through `defineExpose`.
- When D13 corrects that glossary list, extend the grandfather clause to c-table's `updateMobileLabels()`, the `no-mobile-labels` row attribute and the `c-table__mobile-label` class.

### 31. c-slider `aria-label-internal` — NEEDS-CALL
**Evidence**
- 3.x had `@Prop({ attribute: 'aria-label' }) ariaLabelInternal` (`legacy-main c-slider.tsx:37`), so 3.x markup wrote `aria-label="…"`.
- The 4.x port lost the attribute mapping. A 3.x `aria-label` now falls through to `[part=root]` (no `inheritAttrs: false`), not to the range input.
- `aria-label-internal` wins over `label` on the input (`CSlider.vue:26`), and it is also appended to the visible label (`:302-303`).
- Deleting it, as planned, leaves no way to give the slider an accessible name without a visible `label`.

**Recommendation**
- Delete the prop.
- Read the host's `aria-label` attribute (`inheritAttrs: false` + attrs) onto the `<input type="range">`, falling back to `label`, and stop appending it to the visible label.
- This restores 3.x markup and matches c-progress-circle's host `aria-label` route.

### 34. `target` default `''` on c-button + c-list-item — NEEDS-CALL
**Evidence**
- 3.x c-button and c-list-item both had `@Prop() target = '_blank'` (`legacy-main c-button.tsx:105`, `c-list-item.tsx:45`). Today: `c-button/CButton.vue:499`, `c-list-item/CListItem.vue:151`.
- Siblings default to `''`: c-link, c-breadcrumb-item, c-side-navigation-item, c-sub-navigation-item.
- A default change has no path that keeps the old behaviour (ADR-0074), so it is break-now or never. The break is silent: every 3.x `<c-button href>` that relied on opening a new tab now opens in the same tab.
- **Hidden bug:** c-button's Enter/Space handler calls `window.open(props.href, props.target)` (`CButton.vue:582-586`). With `target=''`, the HTML spec treats an empty target as `_blank`. A mouse click would therefore stay in the same tab while Enter or Space opens a new one.

**Recommendation**
- Make the change for consistency with native `<a>`.
- Fix the keydown path in the same PR: let the native `<a>` handle Enter, and for Space call `rootRef.click()`, or mirror `CSubNavigationItem.vue:162-163`.
- Add a behaviour spec, and a prominent migration-guide line: "add `target="_blank"` where you relied on new tabs".
- MyCSC impact is unknown: grep it for `c-button`/`c-list-item` with `href`.

### 35. c-side-navigation-item `select` detail — NEEDS-CALL
**Evidence**
- Plan D4: "`itemChange` → `select` (detail = originating event), like c-menu". Plan D12: "`select` detail typed like c-menu's". These contradict each other.
- c-menu's detail is `{ value: unknown }` (`c-menu/CMenu.vue:102`; D13 narrows it to `{ value: string | undefined }`).
- c-side-navigation-item has no `value` prop. Its current detail is the raw `Event` (`CSideNavigationItem.vue:64`).
- ADR-0075 says only "fires `select` when activated, as `c-menu` does".

**Recommendation**
- Use `{ value: string | undefined }`, bubbling and composed, plus a new optional `value?: string` prop on the item, as on c-menu-item. A single `@select` on `<c-side-navigation>` can then route by value.
- Fix D4's wording.
- Use the same shape for c-sub-navigation-item's later `select` (D13).

### 38. c-accordion-item slot `header` → `heading` — NEEDS-CALL
**Evidence**
- The slot only replaces the heading text (`c-accordion-item/CAccordionItem.vue:17-19`, fallback `{{ heading }}`), so `heading` is the glossary's name: Heading, `CONTEXT.md:22-24`, "accept it under the name `heading`, prop and slot alike", _Avoid_ "header".
- But `@slot header` was 3.x (`legacy-main c-accordion-item.tsx:17,238`), and the docs canon `app/examples/c-accordion-item/custom-header.*` (all four flavours) uses it.
- A leftover `slot="header"` matches no slot. Light DOM with an unknown slot name is not rendered, so the custom heading silently disappears.
- This is the case D13's "3.x-era names in wide use → add + deprecate" rule exists for.

**Recommendation**
- Rename now, but nest a fallback: `<slot name="heading"><slot name="header">…</slot></slot>`. Document `header` as deprecated once D13's mechanism exists; remove it in 5.0.
- Update the four canons.

### 39. `CToastMessage.title` → `heading` — NEEDS-CALL
**Evidence**
- The glossary agrees: Heading, _Avoid_ "Title".
- `title` is the 3.x field (`legacy-main src/types/index.ts` `CToastMessage.title`), read at `c-toast/CToast.vue:21`.
- An object literal passed straight to `addToast` gets TypeScript's excess-property error, but a message built elsewhere, or in plain JS, silently loses its heading.
- Canons using `title`: `c-toast/basic.*`, `c-toasts/basic.*`, `c-toasts/placement.*`.

**Recommendation**
- Add `heading` and render `heading ?? title`.
- Mark `title` `@deprecated` in the TypeScript type now; IDEs show it without the manifest mechanism.
- Remove `title` in 5.0. Update the canons.

### 40. c-select part `menu` → `panel` — NEEDS-CALL
**Evidence**
- c-select's single `<dialog part="menu">` (`c-dropdown/CDropdown.vue:12-15`) is both the positioned panel and the painted surface.
- On the siblings, `panel` is the popover container and `card` carries the background, radius and shadow (`c-autocomplete/CAutocomplete.vue:687` vs `:699`; `c-tree-select/CTreeSelect.vue:714` vs `:755`).
- Renaming to `panel` alone means a consumer's `::part(card) { background }` rule styles every value field except c-select.

**Recommendation:** stamp `part="panel card"` on the dialog, and export both names from c-select (`CSelect.vue:16`, `STATIC_EXPORTED_PARTS`). The rename itself follows the glossary (Dropdown, `CONTEXT.md:32-34`, _Avoid_ Menu).

### 41. c-checkbox `label`/`content` parts — NEEDS-CALL
**Evidence**
- `part="label"` sits on the `<label>` row around the indicator and the text (`c-checkbox/CCheckbox.vue:24`), and `part="content"` on the label text (`:58`).
- c-switch stamps `label` on the text (`c-switch/CSwitch.vue:52`).
- ADR-0022 Consequences: "`part="label"` becomes a uniform customization contract".
- The plan says "per ADR-0022" but does not say what the row becomes. 3.x had no parts, so this is alpha-only.

**Recommendation**
- Text wrapper → `label`.
- The row gets no part. A name such as `control` can be added later without a break.
- Drop `content` from c-checkbox. c-radio keeps its `content`, because a radio is not labelable on its own.

### 42. c-color-picker `color-chip` — NEEDS-CALL
**Evidence**
- `CColorPicker.vue:32,119,564`: the part paints the committed colour.
- The glossary rejects "chip" (Colour button, `CONTEXT.md:234-236`; Swatch).

**Recommendation:** `value-color`. It pairs with the existing `original-color` and `new-color` parts. Alpha-only.

### 47. `CAlertIconType` — NEEDS-CALL
**Evidence**
- `export type CAlertIconType` (`c-alert/CAlert.vue:37`) is used only to build `CAlertType` (`:67`), and is exported at `src/index.ts:83` and `api.entry.snapshot.json:27`.
- No prop is typed with it.
- Its own doc says every type renders an icon, so "icon type" is not a concept (Component-owned type, `CONTEXT.md:701-703`).

**Recommendation:** remove the export and inline the union into `CAlertType`. Removing an export leaves no new name to freeze. If a status-only subset is needed later, adding one is a non-breaking change.

---

## Other findings (outside the verdicts)

- **c-radio implementation trap (#26):** c-radio-group listens on its own host in the bubble phase (`c-radio-group/CRadioGroup.vue:365`, added in `onMounted`). Vue attaches a consumer's `@change` on the same host before the element connects, so the consumer's listener runs first. A `stopPropagation()` in `onRadioChange` therefore cannot stop it. Use a capture-phase listener on the host, or rename the radio's event to an `@internal` lowercase name (for example `radioselect`).
- **3.x attribute names were remapped by Stencil, and the 4.x port lost the mapping.** In 3.x:
  - `hostId` was the attribute `id` on 11 tags.
  - `hostName` was `name`; `automaticCapitalize` was `autocapitalize`.
  - `hasAutofocus`/`automaticFocus` were `autofocus`; `ariaLabelInternal` was `aria-label`.
  - `hostDisabled` was `disabled` on c-switch and c-tab-buttons.

  So `host-id`, `element-id`, `automatic-capitalize` and `has-autofocus` are alpha-era *attribute* names, while 3.x markup's `id=`/`autocapitalize=`/`autofocus=` silently stopped reaching the inner input. That changes the premise of D13's "add + deprecate" tier for those names; worth re-checking in the D13 review.
- **`hidden` does nothing on any `c-*` host today.** `:host { display: contents }` outranks the UA `[hidden]` rule (see #2), and the library has no `:host([hidden])` rule.
- **c-otp-input's 3.x `reset()` is already gone silently.** It was a 3.x `@Method`; 4.x keeps a dead `const reset` (`COtpInput.vue:412-417`) that is not exposed. The migration guide does not mention it.
- **Implementation notes**
  - #44: `CSideNavigationItem.vue` and `CSubNavigationItem.vue` close the drawer through `document.querySelector('c-side-navigation').menuVisible = false`. Move them to `open` and make the change fire `change:open`.
  - #45: c-checkbox's `name` docblock says the prop matters "when the checkbox participates in a native `<form>`". That is false: nothing is form-associated (ADR-0023).
