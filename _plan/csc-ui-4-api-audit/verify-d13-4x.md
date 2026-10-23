# D13 deferral lists — verification (2026-10-23)

Scope: `_plan/csc-ui-4-stable-release.md:143-157`, both deferral lists ("4.x: add + deprecate, remove in 5.0" and
"4.x additive only"), split into 39 items. Unless a path says otherwise, component paths are relative to
`packages/csc-ui/src/components/`. "Legacy" means `origin/legacy-main:packages/csc-ui/src/components/<tag>/<tag>.tsx`
(3.x Stencil). There is no MyCSC checkout, so MyCSC usage is unknown for every item.

**Counts:** CONFIRMED 16 · CONTRADICTS-DOCS 1 · WRONG-CLAIM 0 · WRONG-BUCKET 10 · NEEDS-CALL 12

**Cross-cutting finding.** In 3.x, several of these props were mapped onto native attribute names
(`@Prop({ attribute: 'id' }) hostId`, `attribute: 'autocapitalize'`, `attribute: 'autofocus'`). 4.x renamed those
attributes to `host-id`, `element-id`, `automatic-capitalize` and `has-autofocus`. So those attribute spellings exist
only in the alphas. 3.x markup that uses the native names already goes nowhere in 4.x, and the migration guide does not
mention it.

| # | Item | Verdict | One-line reason |
|---|------|---------|-----------------|
| 1 | c-button / c-icon-button `outlined`/`ghost`/`text` → `variant` | CONTRADICTS-DOCS | c-button/usage.md:1-3 names this axis "appearance", and the glossary already uses "variant" for two other things. A which-wins rule is also missing. |
| 2 | c-checkbox / c-switch `checked` → `value` | NEEDS-CALL | The deprecation path works, but removing `checked` in 5.0 leaves plain markup with only the bare-`value` cast trick, and usage.md and the canons currently recommend `checked`. |
| 3 | `hide-details` → `hide-message` (fields) | NEEDS-CALL | The name matches the `message` part. Combining the two names with OR breaks an instance opting out of an app default, so a precedence rule must be written down. |
| 4 | c-pagination `hide-details` / `hide-range` / `simple` | NEEDS-CALL | No target is named. Here `hide-details` hides exactly `part="details"`, and the audit's proposed names misdescribe what each prop hides. |
| 5 | c-progress-bar `hide-details` (not in the plan, but caught by a blanket rename) | NEEDS-CALL | It hides `part="details"` (the percentage), not a message. Renaming it to `hide-message` would be wrong. |
| 6 | `host-id` / `element-id` / `input-id` unified | WRONG-BUCKET | Only the alphas used these attribute names (3.x used `id`). `input-id` is already handled by D12. No target is named. |
| 7 | c-pagination `currentPage`/`itemsPerPage` → `page`/`pageSize` | WRONG-BUCKET | Changing the value shape has no clean additive path. D3 and D12 already change this object before rc.1. |
| 8 | `width` → stroke name on c-spinner / c-loader | NEEDS-CALL | The new name is not chosen (`thickness` or `stroke-width`). Both props have built-in defaults, so a which-wins rule is needed. |
| 9 | `width` → stroke name on c-progress-circle | WRONG-BUCKET | The tag is new in 4.x (4f24cf04, 2026-08-31), so the name has only alpha users. |
| 10 | c-button `no-ripple` (polarity) | WRONG-BUCKET | Alpha-only (not in legacy c-button), and it is parent wiring set by c-button-group. Make it `@internal` with D12. |
| 11 | c-list-item `ripple` (polarity / interactivity) | NEEDS-CALL | It is 3.x, but no target is named, and the plan would deprecate a meaning rather than a name, which `@deprecated` cannot express. |
| 12 | c-card `fullscreen` → `show-fullscreen` | CONFIRMED | CCard.vue:85. 3.x (legacy :26). Follows ADR-0065's `show-*` naming. Two booleans defaulting to false combine cleanly with OR. The target comes from the audit; write it into the plan. |
| 13 | c-status vs c-alert neutral look | NEEDS-CALL | Neither direction needs a deprecation. Adding `'default'` to c-status is additive (but not if its built-in default changes). Dropping it from c-alert touches an alpha-only member. |
| 14 | c-toasts `vertical`/`horizontal`/`absolute` → placement | NEEDS-CALL | The prop name is unsettled (`placement` or the overlays' `position`). The old props have built-in defaults, so a which-wins rule is needed. |
| 15 | `automatic-capitalize` → `autocapitalize` | WRONG-BUCKET | The 3.x attribute was already `autocapitalize` (legacy :39). The 4.x spelling is alpha-only, and renaming it now restores 3.x markup. |
| 16 | c-otp-input `has-autofocus` | WRONG-BUCKET | The 3.x attribute was `autofocus` (legacy :31). The 4.x spelling is alpha-only. |
| 17 | c-otp-input `element-id` | WRONG-BUCKET | The 3.x attribute was `id` (legacy :47), so the 4.x name is alpha-only. It is also listed twice in the plan, and the component has a bug that overwrites the host's `id`. |
| 18 | c-slider `labels` → `tick-labels` | CONFIRMED | CSlider.vue:215, next to `label` (:208). 3.x (legacy :72). Two false-default booleans combine cleanly with OR, and the new name sits naturally beside `ticks`. |
| 19 | c-side-navigation-item `active` (current vs expanded) | NEEDS-CALL | Neither new prop is named. The parent component writes `active` itself. The glossary avoids "active" for the current page. |
| 20 | Deprecation mechanism ("dev-mode warning") | NEEDS-CALL | The published bundle is hard-coded to production, so there is no dev mode. The example smoke fails on any `console.warn`. |
| 21 | `texts`: c-side-navigation | CONFIRMED | "Close sidemenu" at CSideNavigation.vue:5. Adding the prop is additive. |
| 22 | `texts`: c-sub-navigation-item | NEEDS-CALL | ", Current page" (:15) repeats `aria-current="page"` (:4). Delete the string; do not freeze it as a `texts` key. |
| 23 | `texts`: c-toast | CONFIRMED | `aria-label="close"` at CToast.vue:27. Put `texts` on c-toasts; the per-message `closeText` (3.x) wins over it. |
| 24 | `texts`: c-tabs | CONFIRMED | Additive. The arrows (CTabs.vue:3-10, 26-33) currently have no accessible name at all, which is a separate bug to fix. |
| 25 | `texts`: c-tab-buttons | CONFIRMED | CTabButtons.vue:242-245. Additive. Host the keys on c-tabs, because c-tab-buttons' value API goes internal (D12). |
| 26 | `texts`: c-steps | CONFIRMED | Screen-reader summary at CSteps.vue:135. Additive. |
| 27 | `texts`: c-navigation-button | WRONG-BUCKET | The button has no accessible name at all, and `inheritAttrs: false` blocks a host `aria-label`. Its canon will fail D14's axe gate, so the way it gets named must be decided before rc.1. |
| 28 | `texts`: c-alert | CONFIRMED | `aria-label="Dismiss"` at CAlert.vue:20. Additive. Note that c-tag uses `close-label` for the same thing. |
| 29 | `texts`: c-card | CONFIRMED | CCard.vue:5,7, "Enter/Exit fullscreen". Additive. |
| 30 | c-sub-navigation-item `select` | WRONG-BUCKET | A bubbling `select` added after rc.1 would reach the side-nav coordinator and collapse the parent. Existing `@select` listeners would also start hearing sub-items. |
| 31 | Text-family `label`/`message`/`root`/`input` parts | CONFIRMED | c-input's parts are not forwarded (no `exportparts` in CTextField, CTreeSelect, CNumberField). Adding parts is additive. |
| 32 | c-text-field `min`/`max` accept date strings | CONFIRMED | CTextField.vue:242-249 is compiled as `[null, Number]`, which gets no attribute casting, so widening to `number \| string` changes no runtime behaviour and only widens a union. |
| 33 | c-otp-input `disabled` | CONFIRMED | Missing from the snapshot. Adding it is additive. |
| 34 | c-otp-input `texts` | CONFIRMED | Hard-coded English at COtpInput.vue:35 and :299-302. Additive. |
| 35 | c-side-navigation `autoheight` class → prop | NEEDS-CALL | No prop name is given. The class is outside the manifest, so ADR-0074 does not protect it and `@deprecated` cannot mark it, yet usage.md promises it. |
| 36 | `C*Props` exports | WRONG-BUCKET | Choosing "none" is only possible before rc.1. The exported Props types also carry props that D12 makes internal (`CTabButtonsProps.value`, `CToastProps.message`, `CButtonProps.noRipple`). |
| 37 | `addToast` returns the id | CONFIRMED | Returns void today (CToasts.vue:208). The id is generated inside a rAF (:192-199, called at :219), so generation must move out. Return type `string \| undefined`. |
| 38 | c-tabs arrow parts | CONFIRMED | c-tab-buttons has `scroll-back`/`scroll-forward` parts; the c-tabs arrows have none. Additive. |
| 39 | c-popover `heading` slot | CONFIRMED | Glossary *Heading* (CONTEXT.md:23) says "prop and slot alike". c-alert's precedent: the slot overrides the prop (CAlert.vue:72). Additive. |

---

## Non-CONFIRMED items

### 1. c-button / c-icon-button `outlined`/`ghost`/`text` → `variant` — CONTRADICTS-DOCS

**Evidence**
- The claim holds: `ghost` (CButton.vue:88), `outlined` (:135) and `text` (:157), and the same on CIconButton.vue:66,87,109.
  Combinations resolve through tv compound order (CButton.vue:254-330).
- All three are 3.x props: legacy c-button.tsx:32,37,53 and c-icon-button.tsx:31,41,51. 53 canon files use them.
- The usage doc names the axis **appearance**. c-button/usage.md:1-3: "Use one primary (default appearance) button
  per view; secondary actions use the `outlined`, `ghost` or `text` appearances."
- The glossary already uses "variant" for two other things:
  - **Example variant** (CONTEXT.md:725-727).
  - The tailwind-variants **"variant default"** (CONTEXT.md:782, flagged ambiguity "Default" (d)).
  - ADR-0004 also uses "variant" for the internal tv mechanism.

**Additive path.** It exists, but the plan does not state its rules.
- The new prop cannot carry a built-in default. If it had `'filled'`, then `<c-button outlined>` would resolve to
  "filled + outlined", and the guard cannot tell "unset" from `'filled'`.
- Rule needed: an explicitly set axis prop wins; otherwise the deprecated booleans apply; otherwise the button is filled.
- c-button-group writes `button.text = true` on its children (CButtonGroup.vue:423). That internal wiring has to
  switch to the new prop.

**Recommendation**
- Name the prop after the usage doc: `appearance: 'filled' | 'outlined' | 'ghost' | 'text'`, with no built-in default.
  Avoid a `'default'` member, because of the "Default" ambiguity.
- Write the which-wins rule into the plan.
- Add a glossary entry, **Appearance** (c-button), with _Avoid_: variant.

### 2. c-checkbox / c-switch `checked` → `value` — NEEDS-CALL

**Evidence**
- Both props seed one state: `internalChecked = ref(props.checked || props.value === props.trueValue)` (CCheckbox.vue:421,
  CSwitch.vue:266). Each prop has its own watcher, so the last write wins. Both props are 3.x (legacy c-checkbox.tsx:32,84).
- The docs currently promote `checked`:
  - c-checkbox/usage.md:4 and c-switch/usage.md:4: "Bind the state with a plain `v-model` (or the `checked` prop)".
  - Canons c-checkbox/states.vue:5,11 (plus the angular and typescript flavors) use the `checked` attribute.
  - basic.react.tsx:11 uses `checked={subscribed}`.
- The audit says "from markup `value` can never equal `true-value`". That is overstated:
  - `value` compiles to `[Boolean, Number, String]` (dist/csc-ui.js:11122).
  - Vue's `resolvePropValue` casts a bare `value` attribute to `true`.
  - But `value="true"` stays a string and leaves the box unchecked.

**The undecided choice.** Deprecating `checked` is a clean additive path: no new name, and today's last-write-wins
behaviour stays. But it commits 5.0 to a markup idiom (`<c-checkbox value>`) that is obscure, and that differs from the
native `<input checked>` and from React's `checked`. The audit's own fix was different: keep `checked` as a documented
initial-state convenience. Turning `checked` into an initial-only seed would be a behaviour change, and would have to
land before rc.1.

**Recommendation.** Decide explicitly.
- If ADR-0031's single-source rule wins (deprecate `checked`), rewrite usage.md and the canons, and document the
  bare-`value` route.
- Otherwise drop the item and keep `checked` as a permanent alias.
- Either way, fix the wrong `value` docblock (CCheckbox.vue:347-353, "Only used when … native `<form>`") and c-switch's
  copy-pasted "checkbox" docblocks (CSwitch.vue:171-175). These are doc-only and can land any time.

### 3. `hide-details` → `hide-message` on the fields — NEEDS-CALL

**Evidence**
- On the fields, `hide-details` hides the `message` part:
  - CInput.vue:69, CCheckbox.vue:73, CRadioGroup.vue:25, CFileUpload.vue:91.
  - Docblock: "Hide the hint and error messages" (e.g. CTextField.vue:191).
- It is 3.x on autocomplete, checkbox, input, otp-input, radio-group, select and text-field.
- It is `@defaultable` on 9 tags (text-field, number-field, select, autocomplete, tree-select, date, time and colour
  pickers, file-upload). It is not defaultable on c-checkbox, c-radio-group or c-otp-input.

**Glossary.** CONTEXT.md has no term for this region. It defines **Hint** (:606) and **Error message** (:610), which
show in that one place. ADR-0022:48 calls it the "message line". So `hide-message` matches the part name and the ADR
wording, not a glossary entry.

**The which-wins rule.** ADR-0048 resolves "host attribute → own property → app default → built-in". OR-combining two
resolved booleans breaks opt-out: with an app default `hideDetails: true` and an instance `:hide-message="false"`, OR
gives `true`.

**Recommendation**
- Resolve each layer across both names: instance (new, then old) → app default (new, then old) → built-in.
- Add `hideMessage` to `AppDefaults` and `DEFAULTABLE_PROPS` for the 9 defaultable tags.
- Add a glossary entry, **Message line** (`message` part; `hide-message`), with _Avoid_: details.

### 4. c-pagination `hide-details` / `hide-range` / `simple` — NEEDS-CALL

**Evidence**
- `<div v-if="!hideDetails" … part="details">` (CPagination.vue:3) holds the page-size menu (:4) and the range text
  (:32). So `hide-details` hides exactly `::part(details)`.
- `hideRange` blanks only the range text (:370).
- `simple` hides only the numbered buttons (:50). Prev/next stay inside `part="pages"`.
- All three are 3.x (legacy c-pagination.tsx:36,41,65).

**The plan.** It names no target. The audit's targets misdescribe the props:
- `hide-page-size` would hide less than today's `hide-details` does.
- `hide-pages` would not hide the `pages` part.

**Recommendation.** Once the fields use `hide-message`, a simple rule holds: `hide-<part>` hides that part. Under that
rule:
- Keep `hide-details` on c-pagination.
- Keep `hide-range`.
- Rename only `simple` if at all (e.g. `hide-page-numbers`).
- Update ADR-0048's deferred-defaultable note, which names `hideDetails` on c-pagination.

### 5. c-progress-bar `hide-details` — NEEDS-CALL (missing from the plan)

**Evidence.** "Hide the percentage display" (CProgressBar.vue:88-94). It removes `part="details"` (:23-25). It is 3.x
(legacy :20). A blanket "`hide-details` → `hide-message`" rename would be wrong here.

**Recommendation.** Keep the name, by the same `hide-<part>` rule as item 4. State this in the plan so the rename does
not catch this tag.

### 6. `host-id` / `element-id` / `input-id` unified — WRONG-BUCKET

**Evidence**
- In 3.x the *attribute* was `id` on every tag: `@Prop({ attribute: 'id' }) hostId` in legacy c-text-field.tsx:70,
  c-checkbox.tsx:53, c-select.tsx:48, c-autocomplete.tsx:70, c-button.tsx:90, c-slider.tsx:25, c-switch.tsx:62 and
  c-radio-group.tsx:60; c-otp-input.tsx:47 `elementId`.
- 4.x publishes the attribute `host-id` (e.g. c-checkbox/api.snapshot.json:9) on 13 tags.
- No 4.x component reads the host `id`; grep finds only writes, at COtpInput.vue:432 and CToast.vue:659.
- So the `host-id` attribute has alpha users only, and 3.x `<c-text-field id="x">` already silently stopped reaching
  the inner input. The migration guide does not say so.
- Behaviour still differs by tag:
  - CTextField.vue:527 sets the inner input id.
  - CSelect.vue:663-671 only prefixes ids; its input gets no id.
  - COtpInput.vue:254 prefixes digit ids.
- `input-id` is already covered before rc.1: c-input becomes an internal tag and c-message `input-id` is deleted (D12).
- No target name is given.

**Recommendation.** Decide before rc.1.
- Either delete `host-id` and `element-id`. Ids inside a shadow root are unreachable from page `for`/`aria-*`
  references, which is ADR-0033's premise, so tests should select by role or part.
- Or keep one name with one meaning (e.g. `input-id` = the native input's id on every field).
- Add a migration-guide line about 3.x `id`.
- Drop `input-id` from this bullet.

### 7. c-pagination `currentPage`/`itemsPerPage` → `page`/`pageSize` — WRONG-BUCKET

**Evidence**
- `CPaginationOptions` is defined at CPagination.vue:98-106 and is 3.x.
- The component reads `value.currentPage` and `value.itemsPerPage` (:323-324) and writes `startFrom`, `endTo`,
  `currentPage` and `itemsPerPage` back into the consumer's object (:327-335).

**Why the additive path fails.** With both keys in the object, `{...value, page: 3}` still carries the written-back
`currentPage: 2`, and `{...value, currentPage: 3}` still carries `page: 2`. Whichever key wins breaks the other
population. There is no clean which-wins rule.

**Why it is cheap now.**
- D12 already deletes `textOverrides` from this object.
- D3 adds `change` with this object as its detail.
- So every c-pagination consumer edits this code before rc.1 anyway.
- The `items-per-page` part rename that comes with it is a part rename, which the plan's own rule puts before rc.1.

**Recommendation.** Rename the fields and the part before rc.1. Consider the audit's fuller fix as well: move
`itemCount`, `pageSizes` and `totalVisible` into props.

### 8. `width` → stroke name on c-spinner and c-loader — NEEDS-CALL

**Evidence**
- c-spinner: CSpinner.vue:83 (default 2). c-loader: CLoader.vue:137 (default 4). Both are 3.x (legacy c-spinner.tsx:25,
  c-loader.tsx:32).
- `width` means the box on c-csc-logo (:66) and c-modal (:151).
- Canons use it: c-spinner/basic.vue:5,7.

**What is undecided**
- The new name: `thickness` or `stroke-width`.
- The which-wins rule. Both props carry a built-in default, so the new prop needs none, and must resolve as
  `new ?? width`.

**Recommendation**
- Use `thickness` (not an SVG presentation-attribute name) on all three tags.
- c-loader consumers already edit their markup before rc.1 (`visible` → `hidden`, `contentdelay` → `content-delay`),
  so consider renaming c-loader now as well.

### 9. `width` on c-progress-circle — WRONG-BUCKET

**Evidence.** CProgressCircle.vue:123. The tag was added in 4f24cf04 (2026-08-31) and does not exist on legacy-main.

**Recommendation.** Rename now, to the name chosen in item 8. ADR-0074 says alpha-only names are fixed before 4.0.0.

### 10. c-button `no-ripple` — WRONG-BUCKET

**Evidence**
- `noRipple` (CButton.vue:128) does not appear in legacy c-button.tsx; 3.x had `grouped` instead.
- c-button-group sets it on its children (CButtonGroup.vue:424), which makes it parent wiring, like `disabledByParent`.
- It also sits in the exported `CButtonProps`; see item 36.

**Recommendation.** Mark it `@internal` in D12's internal-surface PR. That removes the polarity clash from the public API.

### 11. c-list-item `ripple` — NEEDS-CALL

**Evidence**
- `ripple` (CListItem.vue:133) also sets `tabindex="0"` (:192). This is 3.x heritage (legacy :67-70).
- No target is named.
- The "deprecate" mechanism marks a name, but `ripple` keeps its name. Only its focusability meaning would go.

**Recommendation.** Once item 10 lands there is no polarity clash left. Either drop the item, or add `interactive`
additively, documenting in usage.md (not via `@deprecated`) that `ripple` stops implying it in 5.0.

### 13. c-status vs c-alert neutral look — NEEDS-CALL

**Evidence**
- `CStatusType` has no `'default'` and no built-in default (CStatus.vue:21; snapshot `type` has no default).
- `CAlertType = 'default' | …` with default `'default'` (CAlert.vue:67).
- In 3.x neither type had a default member (legacy types/index.ts:132-137). c-alert's `'default'` arrived in 84882b8b
  (4.x).

**What is undecided.** The direction is unstated, and neither direction needs a deprecation:
- Adding `'default'` to c-status widens a union, which is additive. But the audit's "built-in default `'default'`"
  changes a built-in default, which ADR-0074 and the D10 guard classify as breaking.
- Dropping `'default'` from c-alert removes an alpha-only member, so it belongs before rc.1 alongside D12's
  `CAlertIconType` rename.

**Recommendation.** Add `'default'` to `CStatusType` with no built-in default, as an additive change (it can even land
now). Move the item to the additive list.

### 14. c-toasts `vertical`/`horizontal`/`absolute` → placement — NEEDS-CALL

**Evidence**
- CToasts.vue:27,34,41 with defaults (:98-100). All three are 3.x (legacy c-toasts.tsx:26-36).

**The name.** The plan says "placement"; the audit says `position`. The overlays' prop is `position`, typed
`CPlacement`, and D13 pre-rc.1 renames `CPlacement`. The docs canon is `c-toasts/placement.vue`. The word should be
settled library-wide before that `CPlacement` rename picks one.

**The which-wins rule.** `vertical` and `horizontal` default to `'bottom'` and `'center'`, so the new prop must have no
built-in default and must win when set.

**`absolute` → `contained`.** The rename fits the glossary's *Static* rule (CONTEXT.md:306-308: name it for the
behaviour, not the CSS keyword). Two booleans combine cleanly with OR.

**Correction to the audit.** It calls the overlays "logical". `CPlacement` has physical `left`/`right` sides plus
`-start`/`-end` alignments (c-menu/api.snapshot.json:5).

**Recommendation.** Use `position: CToastsPosition` (`bottom`, `bottom-start`, …), with no built-in default; `position`
wins when set.

### 15. `automatic-capitalize` → `autocapitalize` — WRONG-BUCKET

**Evidence**
- Legacy c-text-field.tsx:39 is `@Prop({ attribute: 'autocapitalize' }) automaticCapitalize`, so 3.x markup wrote
  `autocapitalize`.
- 4.x publishes `automatic-capitalize` (c-text-field/api.snapshot.json:5).
- The compiled component forwards only `e.automaticCapitalize`. A 3.x `autocapitalize="none"` lands on the host's
  global attribute and never reaches the input.
- `autocorrect` (CTextField.vue:167) shows that a native-named prop works.

**Recommendation.** Rename now. This restores 3.x markup. Only 3.x JavaScript property writers of `automaticCapitalize`
would be affected (MyCSC unknown).

### 16. c-otp-input `has-autofocus` — WRONG-BUCKET

**Evidence**
- Legacy c-otp-input.tsx:31 is `@Prop({ attribute: 'autofocus' }) hasAutofocus`.
- 4.x publishes `has-autofocus` (snapshot :5; COtpInput.vue:183), so 3.x `<c-otp-input autofocus>` silently stopped
  working.

**Recommendation.** Rename to `autofocus` before rc.1.

### 17. c-otp-input `element-id` — WRONG-BUCKET

**Evidence**
- Legacy c-otp-input.tsx:47 is `@Prop({ attribute: 'id' }) elementId`, so the 4.x `element-id` is alpha-only.
- It is listed twice in the plan (here and in item 6).
- **Bug:** `host.id = resolvedId.value` on mount (COtpInput.vue:432), where `resolvedId = elementId || useId()` (:254).
  This replaces a consumer's `<c-otp-input id="x">` with an auto id.
- c-otp-input has no behaviour spec at all; there is no `COtpInput.spec.ts`.

**Recommendation.** Fold this into item 6's decision before rc.1. Fix the overwrite as a `Fix(` PR with a new spec.

### 19. c-side-navigation-item `active` (current vs expanded) — NEEDS-CALL

**Evidence**
- `active` (CSideNavigationItem.vue:168) also drives expansion: `:aria-expanded="!!active"` (:22).
- c-side-navigation's accordion writes `active` on the items (CSideNavigation.vue:242-260).
- The canon expands "Projects" with `active` (examples/c-side-navigation/basic.vue:16).
- Glossary:
  - **Current crumb** (CONTEXT.md:86-88) avoids "active" for the current page.
  - **Active** (:578) is c-button's pressed state.
  - c-accordion-item uses `expanded`.
- The plan's "(current vs expanded)" names neither prop.

**Additive path.** It works with OR semantics: expansion = `expanded || active` through 4.x, and the accordion writes
both. In 5.0, `active` stops expanding. `@deprecated` cannot express that, because it marks a meaning, not a name.

**Recommendation.** Add `expanded` (and `current` if `active` is to go entirely), and write the OR rule into the plan.
D4 and D11 rewrite this wiring before rc.1 anyway, so adding `expanded` there is cheapest.

### 20. Deprecation mechanism ("dev-mode warning") — NEEDS-CALL

**Evidence**
- `packages/csc-ui/vite.config.ts:71-72` defines `process.env.NODE_ENV` as `'production'`, so the published bundle has
  no dev mode.
- Existing runtime warnings are always-on `console.warn` calls (e.g. CColorPicker.vue:948).
- Behaviour specs fail only on `console.error` and `[Vue warn]` (`src/test/harness.ts:298`), so `consoleSpy.expect` is
  not needed for a warn.
- The docs example smoke does fail on any `console.warn` (csc-ui-documentation/tests/examples.spec.ts:61-62). So every
  deprecating PR must migrate all four flavors of the affected canons (53 files for item 1).

**Recommendation.** Use an always-on warning, once per (tag, name) per page: `[c-button] "outlined" is deprecated, use
…`. State in the plan that the deprecating PR migrates the canons.

### 22. `texts` for c-sub-navigation-item — NEEDS-CALL

**Evidence.** The sub-navigation item sets `:aria-current="active ? 'page' : undefined"` (CSubNavigationItem.vue:4)
*and* renders a screen-reader-only ", Current page" (:15). Assistive technology announces the state twice. The
`aria-current` announcement is already in the user's language.

**Recommendation.** Delete the string as a fix (it is not API). Do not freeze a redundant `texts.currentPage` key.

### 27. `texts` for c-navigation-button — WRONG-BUCKET

**Evidence**
- The template is `<c-icon-button … part="root" text><c-icon :path="menuIcon" /></c-icon-button>`
  (CNavigationButton.vue:1-3), and the svg has no title (CIcon.vue:2-9).
- `defineOptions({ inheritAttrs: false })` (:36) blocks a host `aria-label`.
- So the button has no accessible name, and no public way to give it one.
- Its canon (examples/c-navigation-button/basic.*) will fail D14's axe `button-name` rule, which gates rc.1.

**Recommendation.** Choose how it gets named before rc.1. Forward the host's `aria-label` to the inner button, with an
English default ("Menu"), like the other icon-only controls. `texts` can stay a 4.x additive change. If `texts` is
chosen as the way to name it instead, it must land before rc.1.

### 30. c-sub-navigation-item `select` — WRONG-BUCKET

**Evidence**
- c-side-navigation listens for the item event on its host (CSideNavigation.vue:292). It is `select` after D4.
- On every hit, its handler sets `active = false` on every parent holding sub-items, then `active = true` on the
  target (:242-260).
- A bubbling, composed `select` from a sub-item, added after rc.1, would therefore collapse that sub-item's own parent.
- It would also start reaching every consumer `@select` on c-side-navigation and on parent items, which is the contract
  D4 creates.
- That is a behaviour change, not an addition. Sub-items currently emit nothing (CSubNavigationItem.vue:149-163), and
  the canon works around it with `@click` + `@keyup.enter` (examples/c-side-navigation/basic.vue:19-31).

**Recommendation.** Do it inside D4 before rc.1, as the plan itself hints ("cheap to do with D4"). Have the coordinator
filter on the target tag.

### 35. c-side-navigation `autoheight` class → prop — NEEDS-CALL

**Evidence**
- The class is implemented as `:host(.autoheight)` (CSideNavigation.vue:339). It is 3.x (legacy scss:16).
- It is promised in c-side-navigation/usage.md:17 and in migration.ts:484 ("it stays for standalone use").
- The glossary's *Drawer* entry (CONTEXT.md:294-296) names the state `autoheight`.

**What is undecided**
- The prop name: the audit suggests `fill-viewport`.
- How a class can be deprecated: it is outside the manifest, so ADR-0074 ("not public: … internal classes") does not
  freeze it, and `@deprecated` cannot mark it.

**Recommendation.** Add a boolean prop `autoheight`. It matches the glossary and the 3.x word, and replaces the class
one-for-one. Keep the class as an alias documented only in usage.md until 5.0. Adding the prop is additive, so it can
land at any time.

### 36. `C*Props` exports — WRONG-BUCKET

**Evidence**
- 30 `C*Props` types are exported (src/index.ts:84-249), and they are recorded in `src/api.entry.snapshot.json`.
- "None" — the audit's alternative — is a removal, so it is possible only before rc.1.
- Several exported interfaces contain props that D12 makes internal:
  - `CTabButtonsProps.value` (CTabButtons.vue:62-79).
  - `CToastProps.message` (CToast.vue:54-61; internal if standalone c-toast is unsupported).
  - `CButtonProps.noRipple` (item 10).
- An exported type that carries an `@internal` prop publishes that prop as public API (glossary *Internal*,
  CONTEXT.md:697-699).

**Recommendation.** Decide with D12, before rc.1:
- Either generate or strip Props types without their `@internal` members,
- Or stop exporting Props types at all.

Only "export the remaining ones" stays a 4.x additive change.

---

## Notes on CONFIRMED items (no action needed beyond the plan)

- **12 c-card.** c-card has no usage.md. The methods `enterFullscreen` and `exitFullscreen` work regardless of the prop
  (snapshot :8-11).
- **23 c-toast texts.** Precedence is per-message `closeText` (3.x, legacy types/index.ts) > c-toasts `texts.close` >
  built-in.
- **24 c-tabs.** The unnamed overflow arrows are a WCAG bug that can be fixed at any time with English defaults. No
  canon overflows, so D14's axe gate will not catch them.
- **28 c-alert.** Three ways exist to set one closeable string: c-tag `close-label`, c-toast `closeText`, and c-alert
  `texts.close`. Pick one way for closeable components when this lands.
- **37 addToast.** The id must be generated synchronously. The rejection path for a second custom toast (:211-216)
  returns `undefined`.
- **39 c-popover.** The accessible-name logic (CPopover.vue:332-336) and the "opened without an accessible name"
  warning must account for a slotted heading.
