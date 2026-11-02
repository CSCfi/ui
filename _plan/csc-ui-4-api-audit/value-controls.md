# csc-ui 4.0.0 public-API audit: value controls and fields

**Scope:** c-autocomplete, c-checkbox, c-color-picker, c-date-picker, c-dropdown, c-file-upload, c-input, c-number-field, c-option, c-option-value, c-otp-input, c-radio, c-radio-group, c-select, c-slider, c-switch, c-text-field, c-time-picker, c-tree-select, c-button-group.

**Paths:** relative to `/workspace`. `C/` means `packages/csc-ui/src/components/`.

**Excluded, already decided:**
- Removing the camelCase events.
- The `input` + `update:value` + `change` vocabulary. This covers c-select having no `change`, and `change: void` on c-checkbox, c-switch, c-text-field and c-autocomplete.
- Making wiring events `@internal`, such as c-dropdown's events.

B9 is a consequence of that plan, not a re-report of it.

**Counts:** 11 break-now, 11 consider, 8 note.

---

## Break-now

### c-dropdown, c-input — internal-only elements are published as public API

**Severity:** break-now

**What:**
- Both tags are in `custom-elements.json` and the API snapshots, and the tag map exports them (`src/tag-name-map.ts:958` `CDropdownElement`, `:1141` `CInputElement`). `@cscfi/csc-ui-react` exports `CInput` (`packages/csc-ui-react/src/components.ts:361`).
- Their surface is parent-only:
  - c-dropdown props `parent: HTMLElement | null`, `index`, `type: 'autocomplete' | 'select'`, `dropdown-item-type`, `select-all-row`, `selected` (`C/c-dropdown/CDropdown.vue:332-380`).
  - c-dropdown methods `open`, `close`, `focusItem`, `selectItem`, `setStatusText`, `updateList` (`:891`).
  - c-input props `active`, `filled`, `input-id`, `is-textarea`, documented as "Set by the wrapping form component" (`C/c-input/CInput.vue:303-346`).
- The three internal-only lists disagree:
  - `packages/csc-ui-documentation/app/composables/useManifest.ts:88` lists `c-dropdown` and `c-input`.
  - `packages/csc-ui-documentation/scripts/check-example-parity.mjs:48` lists `c-dropdown` and `c-input`.
  - The React generator (`packages/csc-ui-react/scripts/generate.mjs:40`) lists only `c-dropdown`, despite its "keep in sync" comment.
- The analyzer has no tag-level internal marker. It only drops `_`-prefixed members (`packages/csc-ui/scripts/analyzer/script-api.mjs:284`).

**Why:**
- CONTEXT.md:710 says an internal-only element is one "the consumer never authors at all and which is documented nowhere".
- CONTEXT.md:752 says the public API is everything the manifest publishes per tag. As things stand, every c-dropdown method and prop freezes at 4.0.0.
- ADR-0048 (line 22) still mentions "consumers using the inner field directly", so c-input's status was never decided.

**Proposed fix:**
1. Add a tag-level `@internal` docblock tag that the analyzer honours. It removes the declaration from the manifest, the API snapshot, the tag-map export, the IDE data and the React wrapper.
2. Generate the three `INTERNAL_ONLY` lists from that tag.
3. Decide c-input explicitly. I recommend internal.

**Migration cost:** Low. It affects React consumers importing `CInput` and TS consumers naming `CInputElement` or `CDropdownElement`.

### (cross-cutting) — `valid` defaults to `true`, so markup cannot mark a field invalid

**Severity:** break-now

**What:**
- Affected tags: c-autocomplete, c-checkbox, c-color-picker, c-date-picker, c-file-upload, c-input, c-number-field, c-otp-input, c-radio-group, c-select, c-text-field, c-time-picker, c-tree-select. c-message, outside this group, has it too.
- Each has `valid: boolean = true`. Examples:
  - `C/c-text-field/CTextField.vue:329/498`
  - `C/c-checkbox/CCheckbox.vue:345/369`
  - `C/c-otp-input/COtpInput.vue:224/244`
- From markup the only way to turn it off is `valid="false"`. Vue casts only `""` or the attribute's own name to `true`. Any other string, `"false"` included, stays a truthy string (`node_modules/.pnpm/@vue+runtime-core@3.5.39/node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:5042-5047`).
- Only c-radio-group (`CRadioGroup.vue:209`) and c-file-upload (`CFileUpload.vue:746`) pass `valid` through `coerceBoolean`.
- The others read `!props.valid` directly:
  - c-input (`CInput.vue:444`, `:456`), which sits behind every text-family field and picker.
  - c-checkbox (`:373`, `:378`).
  - c-otp-input (`:270`, `:299`).
- So `<c-text-field valid="false" error-message="…">` renders as valid.
- Stencil 3.x parsed a boolean `"false"` as false. An upgraded plain-HTML or Angular template that writes `valid="false"` silently stops showing errors.

**Why:**
- This is the brief's rule against boolean props that default to `true`: HTML booleans are presence-only.
- CONTEXT.md:403 and ADR-0035 call `valid` a consumer-set prop, so consumers must be able to set it from markup.

**Proposed fix:**
- Replace `valid` with `invalid` (default `false`) across the field family. This mirrors `aria-invalid` and `:user-invalid`.
- If the rename is rejected, the minimum non-breaking fix is to read `valid` through `coerceBoolean` everywhere: c-input, c-checkbox and c-otp-input.

**Migration cost:** High but mechanical. Every consumer that sets `valid` changes `:valid="x"` to `:invalid="!x"`. That includes the docs canons (`C/c-text-field/usage.md:94`, `C/c-number-field/usage.md:68`) and 3.x upgraders.

### c-select (via c-dropdown) — the `menu` part names a value picker after the command menu

**Severity:** break-now

**What:**
- c-select publishes `menu`, "The dropdown surface (the positioned dialog) holding the field and the list" (`C/c-select/CSelect.vue:360`).
- It is forwarded by `exportparts` at `:16` and `STATIC_EXPORTED_PARTS` at `:1348`. Its source is `C/c-dropdown/CDropdown.vue:172`.
- The sibling value-selection fields call the same surface `panel` + `card`:
  - c-autocomplete (`CAutocomplete.vue:568-569`)
  - c-tree-select (`CTreeSelect.vue:631-632`)
  - the date, time and colour pickers

**Why:**
- CONTEXT.md:34, under Dropdown: "_Avoid_: Menu (a menu is the command-list component; a dropdown is the value picker)".
- CONTEXT.md:341, under Transient list panel: avoid "menu (the component)".

**Proposed fix:** Rename the `menu` part to `panel` in c-dropdown and in c-select's export list. Add `card` if the surface splits the way it does on the siblings.

**Migration cost:** Low. It affects consumers styling `c-select::part(menu)`; nothing in the repo or the docs does.

### c-checkbox — the `label` part is the whole row, and the label text is `content`

**Severity:** break-now

**What:**
- c-checkbox stamps `part="label"` on the `<label>` row that wraps both the indicator and the text (`C/c-checkbox/CCheckbox.vue:24`).
- It stamps `part="content"` on the shared FormLabel that holds the label text (`:56`).
- Every other labelled sibling stamps `label` on the label text itself:
  - c-switch (`C/c-switch/CSwitch.vue:52`). Its `<label>` row is `root`, `:12`.
  - c-radio-group
  - c-otp-input (`COtpInput.vue:23`)
  - c-slider
  - c-button-group
  - c-file-upload
- So `::part(label)` restyles the text on c-switch but the whole row, indicator included, on c-checkbox.

**Why:**
- ADR-0022:99: "`part="label"` becomes a uniform customization contract across every labeled component".
- CONTEXT.md:551 puts c-checkbox and c-switch in the same field-label mode.

**Proposed fix:**
- c-checkbox's FormLabel takes `part="label"`.
- The `<label>` row gets another name, such as `control`, or no part.
- Drop `content` from c-checkbox. c-radio keeps `content` for its slotted option text, because a radio is not labelable on its own.

**Migration cost:** Medium. It affects alpha consumers styling `c-checkbox::part(label)` or `::part(content)`.

### c-color-picker — the `separator` part is published but documented as unused

**Severity:** break-now

**What:**
- The docblock reads `@csspart separator - Unused: the shared typed field's range separator` (`C/c-color-picker/CColorPicker.vue:563`).
- It comes from the shared TypedField (`src/shared/TypedField.vue:55`), which renders it only under `range`. The colour picker has no `range`.

**Why:** CONTEXT.md:399 defines parts as "the curated public set per component — not every internal node". A part that can never match would be frozen into the contract.

**Proposed fix:** Remove it from the manifest. Either let the analyzer's part-symmetry lint treat TypedField's `separator` as conditional, or have range-less hosts opt out of stamping it.

**Migration cost:** None. The part can never match.

### c-color-picker — the `color-chip` part uses a word the glossary rejects

**Severity:** break-now

**What:** `color-chip` is "The colour painted in the colour button, or before the swatch-only field's text" (`CColorPicker.vue:564`, stamped at `:32` and `:119`).

**Why:**
- CONTEXT.md:236, under Colour button: "_Avoid_: Swatch …, chip, preview".
- CONTEXT.md:240, under Swatch: avoid "chip".
- The neighbouring parts already follow the glossary: `original-color`, `new-color`, `swatch`, `notation-switch`.

**Proposed fix:** Rename to `value-color`, the paint of the committed value. It pairs with `original-color` and `new-color`.

**Migration cost:** Low. The component is recent; it affects alpha consumers styling `::part(color-chip)`.

### c-slider — numeric props are typed `number | string` with string defaults, and an internal prop is public

**Severity:** break-now

**What:**
- `min`, `max`, `step`, `segments` and `value` are typed `number | string` (`C/c-slider/CSlider.vue:222-265`). Their built-in defaults are strings: `'0'`, `'100'`, `'1'`, `'10'`, `'50'` (`withDefaults` at `:268`). All the logic coerces them with `+props.x`.
- The value events carry "a number when the current `value` prop is a number, otherwise a string" (`:79`, `:92`), so the emitted type depends on how the consumer bound the prop.
- `aria-label-internal` (`:170`) is a seeded Stencil prop with "internal" in its public name. It is appended to the visible label (`labelText`, `:302`) and wins over `label` as the input's `aria-label` (`:26`).
- The `host-name` docblock says "Id of the element" (`:194-200`).

**Why:**
- The brief's rule against types looser than the behaviour.
- CONTEXT.md:611 gives c-number-field a JS `number` value, the precedent here.
- CONTEXT.md:752: every manifest member is a promise, so an internal prop does not belong there.

**Proposed fix:**
- Type `min`, `max`, `step`, `segments` and `value` as `number` with numeric defaults. Vue custom elements cast `Number` props from attributes.
- Always emit a number.
- Remove `aria-label-internal`; `label` is the accessible name.
- Fix the `host-name` docblock (see B11).

**Migration cost:**
- Vue and React consumers passing strings get a type error. The attribute form `value="50"` keeps working.
- Users of `aria-label-internal`, a 3.x carry-over, lose it.

### c-otp-input — the value has three contradictory shapes

**Severity:** break-now

**What:**
- The `value` prop is typed `string = ''` (`C/c-otp-input/COtpInput.vue:232`).
- `update:value` carries the digits typed so far, as a string (`:113`, `:318`).
- After every keystroke the host's `value` property is overwritten with `null` until every digit is filled (`:308-330`, "null until complete").
  - A plain Vue `v-model`, which reads `el.value` on `input`, therefore sees `null`.
  - A React `onUpdateValue` handler sees the partial string.
- `completion` is typed `null | string` (`:101`) but fires only when the code is full: `value || null` with `value.length === length` (`:320`). It can never be `null`.

**Why:**
- CONTEXT.md:739-741 define one value vocabulary: the `update:value` detail and the host `value` must be the same value.
- The brief's rule against types wider than the behaviour, which `completion` breaks.

**Proposed fix:**
1. Pick one value. I recommend the typed digits as a string, `''` when empty, and stop writing `null` to the host.
2. Type `completion` as `CustomEvent<string>`.
3. If a full code is the commit, consider folding `completion` into the decided `change` and dropping it.

**Migration cost:** Medium. It affects v-model users who rely on null-until-complete, and `completion` listeners if it is folded into `change`.

### c-radio — its bubbling `change` will double c-radio-group's decided `change`

**Severity:** break-now

**What:**
- c-radio dispatches `change`, with its value as detail, using `bubbles: true, composed: true` (`C/c-radio/CRadio.vue:208`).
- c-radio-group catches it on its own host (`C/c-radio-group/CRadioGroup.vue:365`) and never stops it.
- c-radio-group's usage doc advertises this: "The group also emits its radios' bubbling `change` events onward" (`C/c-radio-group/usage.md:41-43`).
- Under the decided plan the group will also dispatch its own `change` on commit. A consumer's `@change` on `<c-radio-group>` would then fire twice per pick: once from the radio (target `c-radio`) and once from the group.
- Marking the radio's event `@internal` removes it from the manifest but not from DOM listeners.

**Why:**
- CONTEXT.md:693-695: an internal event is still "an ordinary DOM event anyone can hear".
- CONTEXT.md:743: one `change` per commit.

**Proposed fix:**
- When making the event internal, also do one of these:
  - rename it to a name no consumer listens for, such as `radioselect`;
  - have the group `stopPropagation()` it at the host.
- Delete the usage.md sentence.

**Migration cost:** Low. It affects consumers that read `event.target` as the c-radio, which is documented today.

### c-select, c-autocomplete — `reset()` is a seeded method that emits value events

**Severity:** break-now

**What:**
- c-select has `reset()`, documented as "Reset select state @seeded from csc-ui — verify" (`C/c-select/CSelect.vue:1327-1337`). c-autocomplete has the same method (`C/c-autocomplete/CAutocomplete.vue:1356-1363`).
- Both clear the value through `emitModelValue`, so `update:value` and `input` fire. On c-autocomplete `change` also fires and the field takes focus (`:1341-1354`).
- c-tree-select and the date, time and colour pickers have no such method, and no usage.md mentions it.

**Why:**
- CONTEXT.md:736: "Emission happens only on user interaction, never when `value` is set programmatically."
- Brief item 2: the sibling value-selection fields have no such method.

**Proposed fix:**
- Remove `reset()`. Consumers assign `value = null`, or `[]` in multiple mode.
- If a programmatic clear is wanted, make it silent and put it on every value-selection field.

**Migration cost:** Low. It affects 3.x users who call `el.reset()`; the fix is a one-line assignment.

### c-checkbox, c-slider — `host-name` where every other field says `name`

**Severity:** break-now

**What:**
- c-checkbox (`C/c-checkbox/CCheckbox.vue:309`) and c-slider (`CSlider.vue:200`) set the inner input's `name` through `host-name`.
- Eight siblings do the same thing through `name`: c-text-field, c-number-field, c-select, c-autocomplete, c-tree-select and the date, time and colour pickers (for example `CTextField.vue:257`).
- c-switch, c-radio-group, c-otp-input, c-button-group and c-file-upload have neither.
- Neither name submits anything:
  - Nothing is form-associated. The only `attachInternals` call in `src` is for custom states (`src/shared/useHostStates.ts:33`).
  - An input inside a shadow root has no form owner in the page.
- Yet c-checkbox documents `host-name` as "Only used when the checkbox participates in a native `<form>`" (`:303-305`).

**Why:** Brief item 2: one concept, two names.

**Proposed fix:**
1. Rename `host-name` to `name`.
2. Decide what `name` promises in 4.0:
   - either make the fields form-associated, through `ElementInternals.setFormValue`, so that `name` submits;
   - or document `name` as the inner input's autofill hint, and fix the c-checkbox docblock.

**Migration cost:** Low. It affects 3.x users of `host-name`.

---

## Consider

### (cross-cutting) — `host-id` / `element-id` / `input-id`: one concept, three names, four behaviours

**Severity:** consider

**What:**
- `host-id`, on 13 tags in this group, never sets the host's id. What it does depends on the tag:
  - On c-text-field, c-number-field, c-checkbox, c-slider and the date, time and colour pickers it becomes the id of the inner shadow-DOM input (for example `CTextField.vue:527`).
  - On c-select it becomes a prefix for the internal c-dropdown's id (`${hostId}-dropdown`, `CSelect.vue:3`) and seeds a derived `input_…` id (`:665-671`). The `<input>` itself gets no id.
  - On c-autocomplete and c-tree-select it prefixes internal listbox and status ids (`CAutocomplete.vue:877`, `CTreeSelect.vue:913`).
- c-otp-input calls the same thing `element-id` (`COtpInput.vue:169`), a prefix for its digit ids.
- c-input calls it `input-id`.
- Every one of these ids lives in a shadow root, so no `for` or `aria-*` reference in the page can reach it. ADR-0033 rests on that same constraint.

**Why:** Brief items 1 and 2. The Stencil-era name misdescribes what the prop does, and the behaviour differs from tag to tag.

**Proposed fix:**
- Either remove these props: consumers put `id` on the host, and tests select by role or part.
- Or keep one name with one meaning. For example, `input-id` is the id of the native input, `element-id` goes, and c-select actually sets it on its input.

**Migration cost:** Medium. It affects e2e tests that target the inner input by id; Playwright CSS selectors pierce open shadow roots.

### c-checkbox, c-switch — `checked` and `value` are two sources of truth

**Severity:** consider

**What:**
- Both components keep one internal state that either prop can set: `internalChecked = props.checked || props.value === props.trueValue` (`CCheckbox.vue:421`, `CSwitch.vue:266`), with a watcher on each prop. Whichever prop changed last wins.
- v-model binds `value`, but `value`'s docblock says "Only used when the checkbox participates in a native `<form>`" (`CCheckbox.vue:347-353`, `CSwitch.vue:227-232`). That is wrong: `value` is the model.
- c-switch's `checked`, `true-value` and `false-value` docblocks say "checkbox" (`CSwitch.vue:171-175`).
- From markup, `value` can never equal the default boolean `true-value`, because attributes are strings. Plain-HTML consumers therefore depend on `checked`.

**Why:** ADR-0031:59-61 removed `checked` from c-radio because "selection has exactly one source of truth".

**Proposed fix:**
- Make one prop authoritative. For example: `value` is the model, and `checked` is documented as an initial-state convenience that defers to it.
- Fix the `value` docblock and c-switch's copy-pasted "checkbox" docblocks.

**Migration cost:** Low to medium, depending on the option chosen.

### c-option — `selected` is both a consumer seed and a parent mirror, and the two parents disagree

**Severity:** consider

**What:**
- `selected` (`C/c-option/COption.vue:37`) plays two roles:
  - The parent reads it as the initial selection.
  - The parent writes it back as a mirror ("external code may read `.selected`", `CSelect.vue:843-852`, `CAutocomplete.vue:1219-1225`).
- c-select seeds by emitting `update:value` and `input`. It does this on mount and on every child mutation: `refreshOptions` calls `emitValue` (`CSelect.vue:1398-1430`; called at `:1452` and `:1455`). In single mode it does so even when `value` is already set.
- c-autocomplete seeds silently, and in single mode only while `value == null` (`CAutocomplete.vue:1722-1739`).

**Why:**
- CONTEXT.md:736 forbids programmatic emission.
- ADR-0031 sets the single-source principle.
- The two parents behave differently for the same markup.

**Proposed fix:** Choose one:
- Document `selected` as an initial-value seed with one rule for both parents: silent, and only when `value` is unset. Stop the parents writing it back.
- Remove it from the public surface.

**Migration cost:** Low if documented. Medium if removed: `<c-option selected>` is common in 3.x markup.

### c-time-picker — the `end-tab` part breaks the switch-part pattern

**Severity:** consider

**What:**
- The end switch's buttons are the `end-tab` part (`C/c-time-picker/CTimePicker.vue:393`, `:81`). The name follows the ARIA `role="tablist"`/`tab` (`:72`).
- The colour picker's equivalent toggle row uses `notation-switch` for the row and `notation` for each button (`CColorPicker.vue:577-578`).

**Why:**
- CONTEXT.md:198, under End switch: "_Avoid_: Tabs, range toggle".
- CONTEXT.md:220, under Notation switch: avoid "tabs".

**Proposed fix:** Rename `end-tab` to `end`, giving `end-switch`/`end` to mirror `notation-switch`/`notation`.

**Migration cost:** Low. It affects alpha consumers styling `::part(end-tab)`.

### c-select, c-autocomplete, c-tree-select — the row part is `item`, but the pickers call it `option`

**Severity:** consider

**What:**
- A `role="option"` row is the `item` part on c-select (`CSelect.vue:365`), c-autocomplete (`CAutocomplete.vue:575`) and c-tree-select (`CTreeSelect.vue:641`).
- The same kind of row is `option` on c-date-picker's month and year lists (`CDatePicker.vue:744`) and c-time-picker's time columns (`CTimePicker.vue:396`).

**Why:**
- CONTEXT.md:600 and :254 define an item as "an `items` entry", which is data, not a row.
- In c-select and c-autocomplete a row is often a slotted `c-option`, not an item.

**Proposed fix:**
- Rename `item` to `option` on c-select and c-autocomplete (and in c-dropdown).
- On c-tree-select, `item` is defensible because its rows are tree items (CONTEXT.md:108). Even so, one name across all list fields is simpler.

**Migration cost:** Medium. It affects consumers styling `::part(item)`.

### (cross-cutting) — `hide-details` means three different things

**Severity:** consider

**What:**
- On the fields (12 in this group), `hide-details` hides the hint/error-message line and its reserved height. c-input documents it as "Hide the hint and error messages" (`CInput.vue:323-328`); the region is the `message` part (`CInput.vue:107`).
- On c-pagination it hides the page-size menu and the range text (`C/c-pagination/CPagination.vue:110-115`).
- On c-progress-bar it hides the percentage (`C/c-progress-bar/CProgressBar.vue:89-94`).

**Why:**
- The name is Vuetify vocabulary.
- The glossary has no "details" concept. The region it hides is the **hint** or **error message** (CONTEXT.md:602-608), stamped as `message`.
- Brief item 2: one name, different concepts.

**Proposed fix:**
- Rename to `hide-message` on the fields, matching the `message` part. It is defaultable, so the `AppDefaults` key changes too.
- At minimum, flag the overload in CONTEXT.md's Flagged ambiguities.

**Migration cost:** High. Every 3.x upgrader and every app default that uses `hideDetails` changes.

### c-tree-select — the `texts` keys `select` and `step`

**Severity:** consider

**What:**
- `select?: (name) => string` labels the select-branch row (`CTreeSelect.vue:609`).
- `step?: (n, total) => string` is the header's level counter (`:615`).

**Why:**
- The siblings name the pinned-row text after its row: `selectAll` for the select-all row (`CSelect.vue:323`). The tree-select's own part is `select-branch` (CONTEXT.md:128-130).
- CONTEXT.md:114, under Level: "_Avoid_: Depth, tier, step, layer".
- `texts` keys are public API (CONTEXT.md:752).

**Proposed fix:** Rename `select` to `selectBranch`, and `step` to `levelCount`.

**Migration cost:** Low. It affects consumers who translate those two keys.

### c-text-field — `min` and `max` cannot express `type="date"` bounds; `automatic-capitalize` is named unlike its siblings

**Severity:** consider

**What:**
- `type` includes `'date'`, and CONTEXT.md:135 sanctions `c-text-field type="date"` as the native date input.
- But `min` and `max` are typed `null | number` and documented "on a numeric input" (`CTextField.vue:242-249`). They are forwarded to the native input (`:83-84`).
- So a date bound such as `'2026-01-01'` is a type error in Vue, React and TS.
- The field keeps the native names `autocomplete` (`:159`) and `autocorrect` (`:167`); `autocorrect` keeps its name even though the React generator has to work around its HTMLElement collision.
- It renames `autocapitalize` to `automatic-capitalize` (`:174`), while the type is still called `CTextFieldAutocapitalize`.

**Why:** The declared type is narrower than the behaviour. The naming is inconsistent with the field's own other native attributes.

**Proposed fix:**
- Widen `min` and `max` to `number | string`, or drop `'date'` and steer users to c-date-picker.
- Rename `automatic-capitalize` to `autocapitalize`.

**Migration cost:** Low. It affects users of `automatic-capitalize`.

### c-otp-input — Stencil-era prop names and gaps against its siblings

**Severity:** consider

**What:**
- It has `element-id` (`COtpInput.vue:169`; see the id finding above) and `has-autofocus` (`:183`). No other field has an autofocus prop, and the native global attribute is `autofocus`.
- It has no `disabled` and no `name`, though every sibling has `disabled`.
- It has no `texts`, and its digit labels and live status are hard-coded English:
  - "Enter code - digit number - i of n" (`:35`)
  - "Currently entered - …" (`:300`)

**Why:** Brief items 1 and 2.

**Proposed fix:**
- Rename `has-autofocus` to `autofocus`, honoured from the host attribute, or drop it.
- Fold `element-id` into the id decision.
- Add `disabled` and `texts`. These are additive and can follow 4.0.

**Migration cost:** Low. It affects 3.x users of `has-autofocus` and `element-id`.

### c-slider — `labels` sits beside `label`, and the built-in unit is `%`

**Severity:** consider

**What:**
- `label`, the field label (a string), and `labels`, "Show tick labels" (a boolean), differ by one letter (`CSlider.vue:208-215`).
- `unit` has the built-in default `'%'` (`:258`). Any slider for another quantity shows "%" until the consumer sets `unit=""`.
- A built-in default cannot change after 4.0 without a breaking release (CONTEXT.md:752).

**Why:** The names are easy to confuse, and the default bakes one unit into a general-purpose control.

**Proposed fix:** Rename `labels` to `tick-labels`. Change `unit`'s built-in default to `''`.

**Migration cost:** Low.

### Text-family fields — no `label`, `message` or `root` parts; c-text-field has no `input` part

**Severity:** consider

**What:**
- The label, the message and the root live in the internal c-input inside each field's shadow root. No field forwards them with `exportparts`.
- What each field publishes instead:
  - c-text-field: only `mask-guide` (`CTextField.vue:360`).
  - c-number-field and the date, time and colour pickers: `input`, but no `label` or `message`.
  - c-select and c-autocomplete: neither `input` nor `label`/`message`.
- c-checkbox, c-radio-group, c-otp-input, c-slider, c-button-group and c-file-upload all publish `label`, plus `message` and/or `root`.

**Why:**
- ADR-0022:99 makes `label` a uniform part.
- CONTEXT.md:399 and ADR-0006 make parts the only customization API.

**Proposed fix:**
- Forward c-input's `label` and `message` (and probably `root`) through `exportparts` on every field built on it.
- Add `input` to c-text-field.
- This is additive, but settle the names now so they match the siblings.

**Migration cost:** None; the change is additive.

---

## Note

### c-slider, c-otp-input — standalone components with no usage.md

**Severity:** note

**What:** Both have docs pages and examples (`packages/csc-ui-documentation/app/examples/c-slider`, `…/c-otp-input`) but no `usage.md`. They have no component description in the manifest, the IDE hover or the tag map.

**Why:** ADR-0026 and CONTEXT.md:705-707 make the first paragraph of `usage.md` the component's description everywhere.

**Proposed fix:** Write both files.

**Migration cost:** None.

### (docs drift) — manifest descriptions contradict the usage docs

**Severity:** note

**What:**
- Prop docblocks tell Vue users to bind with `.prop`:
  - `:texts.prop` (`CSelect.vue:283`, `CAutocomplete.vue:482`, `CTreeSelect.vue:512`)
  - `:items.prop` (`CTreeSelect.vue:439`)
  - `:value.prop` (`CButtonGroup.vue:55`)
  
  But c-button-group's usage.md says `:value="…"`, and the docs canons avoid `.prop` on purpose.
- usage.md writes property-only props in attribute form: `disabled-dates` and `is-date-disabled` (`C/c-date-picker/usage.md:110-111`), and `level-labels` (`C/c-tree-select/usage.md:47`).
- The JSDoc on the exported `CFieldSize` says the default field is 44px (`src/types.ts:10-15`). It is the 52px control height (CONTEXT.md:355, `CInput.vue:377`).

**Proposed fix:**
- Align the docblocks with the usage docs.
- Write property-only props as camelCase property names.
- Fix the `CFieldSize` JSDoc.

**Migration cost:** None.

### c-select, c-autocomplete, c-button-group vs c-tree-select — how `value` is classified as an attribute

**Severity:** note

**What:**
- The analyzer treats any prop whose type text contains `[]`, `{` or `=>` as property-only (`packages/csc-ui/scripts/analyzer/cem.mjs:26`).
- So `value` has no attribute on c-select, c-autocomplete or c-button-group, even though a single-mode string value works as an attribute at runtime.
- Meanwhile `CTreeSelectValue`, which includes an object, is listed as an attribute.
- The IDE data therefore hides `<c-select value="fi">`.

**Proposed fix:** Classify by the scalar members of the union, or add an `@attribute` override.

**Migration cost:** None.

### c-number-field — `texts` keys don't match the parts they label

**Severity:** note

**What:** The step buttons are the parts `step-up` and `step-down` (`CNumberField.vue:267-268`), but their `texts` keys are `increase` and `decrease` (`:255-258`). The glossary calls them **Step buttons** (CONTEXT.md:618-620).

**Proposed fix:** Rename the keys to `stepUp` and `stepDown`.

**Migration cost:** Low.

### c-file-upload — status `texts` keys don't use the status names

**Severity:** note

**What:** The keys are `waiting` (for `queued`), `uploading`, `uploaded` (for `done`) and `uploadFailed` (for `error`) (`CFileUpload.vue:459-468`). `CFileUploadStatus` (`:392`) and CONTEXT.md:257 use `queued`, `uploading`, `done` and `error`.

**Proposed fix:** At least rename `waiting` to `queued`.

**Migration cost:** Low.

### c-number-field, c-file-upload — `value` types widened with `string` for a v-model quirk

**Severity:** note

**What:**
- c-number-field's `value` is `null | number | string` (`CNumberField.vue:249`).
- c-file-upload's `value` is `CFileUploadEntry[] | null | string` (`CFileUpload.vue:371`).
- Both accept `string` so that `''`, which Vue's text v-model writes for `null`, reads as empty. On c-file-upload no string other than `''` means anything.

**Proposed fix:**
- c-number-field: fine as is, since it also takes attribute input.
- c-file-upload: narrow the public type to `CFileUploadEntry[] | null` and tolerate `''` at runtime.

**Migration cost:** None.

### (cross-cutting) — `C*Props` type exports are inconsistent

**Severity:** note

**What:**
- `src/index.ts` (`:92-249`) exports `CAutocompleteProps`, `CSelectProps`, `CTextFieldProps`, `CDatePickerProps` and others.
- It exports nothing for c-checkbox, c-switch, c-radio, c-radio-group, c-slider, c-otp-input or c-option. Their props interfaces aren't even exported from their SFCs.

**Proposed fix:** Pick one policy before 4.0: export every `*Props` interface, or rely on the tag map's `C*Element` interfaces and drop the `*Props` exports before they freeze.

**Migration cost:** Low.

### c-select, c-autocomplete, c-tree-select — `items-per-page` collides with c-pagination's `itemsPerPage`

**Severity:** note

**What:**
- On the list fields, `items-per-page` (`CSelect.vue:196-201`, `CAutocomplete.vue:402`, `CTreeSelect.vue:448`) caps the visible rows, which is what places the **peek** (CONTEXT.md:345).
- On c-pagination, `itemsPerPage` (`CPagination.vue:102`, and the `items-per-page` part at `:4`) is the page size.
- "Item" is also reserved for `items` entries (CONTEXT.md:600).

**Proposed fix:** The glossary already uses `itemsPerPage` for the peek, so a rename such as `visible-rows` is optional. At least list the overload in CONTEXT.md's Flagged ambiguities.

**Migration cost:** High if renamed: every 3.x upgrader and every app default.
