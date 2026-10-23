# Verification of D11–D13 — flagged items and their resolutions

Three read-only passes (`verify-d11-d12.md`, `verify-d13-before-rc.md`, `verify-d13-4x.md`, evidence and
file:line there) checked 124 plan items against source, CONTEXT.md, the ADRs, usage.md, the migration guide and
Stencil 3.x (`origin/legacy-main`). 69 confirmed or already covered; 55 flagged. No MyCSC checkout was available,
so MyCSC usage is unknown throughout.

Root cause of most flags: the D13 sort read "3.x prop" as "3.x attribute". Stencil often exposed props under
native attribute names (`id`, `autofocus`, `autocapitalize`, `aria-label`) or other names (`hide`), so several
"3.x-era" names were alpha-only, and some 3.x markup already broke silently. A mechanical diff of 3.x
`vscode-data.json` against the 4.x manifest found 62 removed 3.x attributes, 22 of them (and 2 removed tags)
never mentioned in the migration guide.

## Decided (2026-10-23)

- **R1 — Restore 3.x / native attribute names** replaced during the alphas: `autofocus` (c-otp-input, c-text-field),
  `autocapitalize` (c-text-field), `aria-label` forwarded to the inner control (c-slider; drop `aria-label-internal`),
  c-loader `hide` (default false — not `hidden`, which is the HTML global; amend ADR-0076). Delete `host-id` /
  `element-id` (shadow-internal ids are unreachable from page `for`/`aria-*`, ADR-0033); the guide says 3.x `id`
  now stays on the host. Fix COtpInput.vue:432 overwriting the host `id`; c-otp-input gets its first spec.
- **R2 — Clean break + migration-guide completeness guard.** No aliases. Commit the 3.x API data
  (`vscode-data.json`; events/slots/methods from 3.x `docs.json` if the 3.0.19 tarball has it); a docs guard fails
  when a 3.x tag/attribute missing from the 4.x manifest has no guide entry. Write the missing entries: the 22
  attributes, `c-menu-items`, `c-text-field-open`, c-otp-input `reset()`, `id`, `textOverrides`, `valid`,
  `slot="header"`, toast `title`, `target`, `--c-icon-color`, slider `unit="%"`.
- **R3 — c-pagination value `{ currentPage, itemsPerPage }` → `{ page, pageSize }`** before rc.1, matching
  c-data-table; emit a new object instead of writing into the consumer's (CPagination.vue:333-335).

## Resolutions for the remaining flags (accepted 2026-10-23)

All accepted as written; #22, #27, #29 and #34 were walked individually and are recorded with the answer chosen.

### Before rc.1 — corrections to D12/D13
1. c-tab / c-tab-item `value` stay **public** (consumer identity in every tabs example). Internal: c-tab `active`,
   c-tab-item `active`, c-tab-items `value`/`disableAnimation`, c-tab-buttons `value`. Delete c-tab
   `host-id`/`position`/`setsize`.
2. c-sub-navigation-item `focusable` → internal too; both nav items share one internal prop, default false.
3. c-toast → `@internal` tag (a composed child, ADR-0013; only `addToast()` creates it); its docs example moves to
   c-toasts. c-toasts forwards `toast-*` parts and emits `close` (D12).
4. c-otp-input value = the digits typed so far everywhere (prop, `update:value`, host property), `''` when empty;
   `completion` carries the full code. Guide entry (3.x was `null` until complete).
5. c-pagination `texts` keys = the 3.x `textOverrides` keys; c-data-table's `texts` gains them and forwards them
   to its embedded pagination. Guide maps `value.textOverrides` → `texts`.
6. c-table `updateMobileLabels()` keeps its 3.x name; the glossary's grandfathered "mobile" list widens to it.
7. `target` default `''` (c-button, c-list-item), and the keyboard path navigates in place when `target` is empty
   (CButton.vue:584 `window.open(href, '')` opens a new tab today).
8. c-side-navigation-item `select` detail `{ value: string | undefined }` + a new `value` prop, like c-menu's
   `select` (supersedes D4's "detail = originating event").
9. c-select part `menu` → `part="panel card"` (one `<dialog>` is both siblings' parts).
10. c-checkbox parts: the label text takes `label` (ADR-0022), the row gets no part, `content` is dropped.
11. color-picker part `color-chip` → `value-color` (siblings `original-color` / `new-color`; glossary avoids "chip").
12. `CAlertIconType`: remove the export, inline the union into `CAlertType`.
13. c-alert's `dismiss` **part** → `close` too, with the D12 prop/event rename.
14. c-radio's composed `change` → an internal wiring event; c-radio-group emits the one public `change`
    (stopPropagation on the group host can't work: Vue attaches the consumer's listener there first).
15. `hidden` hides nothing on any `c-*` host (`:host { display: contents }` beats `[hidden]`): the shared host
    rule gains `:host([hidden]) { display: none !important }`.
16. `--c-icon-color` → private `--_c-icon-color` (c-list-item greys disabled icons through it; ADR-0006 retired
    per-component custom properties); guide line.
17. `mobile` / `mobile-breakpoint` names **stay** (grandfathered; renaming only c-tabs would split it from c-table and
    c-login-card); correct the glossary list (add c-tabs; c-steps has none; side-nav `mobile` is consumer-set).
18. c-accordion-item `expanded`: add a `:state(expanded)` custom state, move the custom-style canon (4 flavors) to it,
    then make the prop internal; document `value` as required on items.
19. c-data-table `change:selected` detail = `string[]` (mirrors `selected`) + a read-only `selectedRows` property.
20. c-data-table `filter` (string) → `query`; widen the glossary's **Query** beyond the search input.
21. c-tooltip **keeps** its `content` slot (ADR-0033; whitespace fills a default slot and hides the `text`
    fallback). Item dropped.
22. c-menu-item: `icon` path prop → `icon` slot (no part, like c-button), drop `active-icon`; the three-state
    `active` → `type: 'command' | 'radio'` (default `'command'`, sets the role; widenable to `'checkbox'` in a
    minor) + `checked` (default false; `aria-checked` and the check mark on a radio item). **Walked: chosen.**
23. List-row part → `option` on c-select, c-autocomplete, c-tree-select and the pickers (every row is
    `role="option"`; the glossary reserves "item" for `items` entries).
24. c-tree-select texts `step` → `levelCounter`.
25. `CPlacement` → split into `CMenuPosition`, `CPopoverPosition`, `CTooltipPosition`.
26. c-option `selected` seeds silently, once, only while the field's value is empty (as c-autocomplete does);
    guide entry (3.x c-select emitted `changeValue` on seed).
27. Moved from the 4.x lists to before rc.1 (alpha-only or no additive path): c-progress-circle `width` →
    `thickness`; c-button `no-ripple` → internal (c-button-group sets it); c-sub-navigation-item `select` with D4;
    c-navigation-button gets an accessible name via `texts.label` (`inheritAttrs: false` blocks a host
    `aria-label`; axe would fail its canon); stop exporting the 30 `C*Props` types (they exist for 30 of 77 tags,
    carry props D12 makes internal, and are alpha-only; `C*Element` is the typed surface — **walked: chosen**); delete c-sub-navigation-item's ", Current page" string (`aria-current`
    already says it); c-alert's neutral `'default'` member (alpha-only) aligned with c-status's spelling.
28. Bugs the passes found on the way: c-tabs overflow arrows have no accessible name; `addToast` creates its id
    inside a rAF (must return it synchronously).

### 4.x — corrections to the deferral lists
29. c-button / c-icon-button: the new prop is **`appearance`** (usage.md's word; "variant" is taken in the
    glossary and stays free for a colour-intent axis), no built-in default, wins over the booleans when set; the
    docs canon `c-button/variants` becomes `appearances`. **Walked: chosen.**
30. `hide-details` → `hide-message` on the **fields** only (the `message` part); c-pagination and c-progress-bar keep
    `hide-details` / `hide-range` / `simple` (each hides its own part — "`hide-<part>` hides that part"). App
    defaults resolve per layer across both names.
31. c-spinner / c-loader `width` → `thickness`, new wins when set.
32. c-toasts `vertical` / `horizontal` / `absolute` → `position` (the overlays' word), no built-in default, wins
    when set.
33. c-side-navigation-item `active` → `current` (page) + `expanded`; the parent writes them.
34. c-checkbox / c-switch — **before rc.1**: one state, two views. `value` is the state; `checked` is its boolean
    view (setting it sets `value` to `trueValue`/`falseValue`, reading it reports `value === trueValue`); a
    `checked` attribute seeds, a bound `value` wins; specs for both directions; nothing deprecated. **Walked:
    chosen.** c-list-item `ripple` (it also controls focusability) stays a deferred 4.x design question.
35. side-nav `autoheight` class → a prop (e.g. `fill-viewport`); the class is outside the manifest, so no
    `@deprecated` — the guide notes it.
36. Deprecation mechanism: manifest `deprecated` → IDE data + React JSDoc only. No runtime warning — there is no dev
    build (vite.config.ts:71-72 pins production) and the example smoke fails on any `console.warn`.

### Implementation notes the passes attached to confirmed items
- Removing `--c-text-*` / `--c-transparent` moves CPagination.vue:233,235 and CNavigationButton.vue:26 to
  `on-surface-muted`, deletes `src/tailwind.css:144`, and adds a guide line beside `--c-font-family`'s.
- Removing `ring` also updates CONTEXT.md, ADR-0010, `customization.ts` and `audit-contrast.mjs`.
- Narrowing `number | string` → `number` keeps the runtime `Number()` coercion (Vue passes static attributes as
  strings, e.g. `<c-steps value="3">`).
- Glossary: **Toast** says "dismiss button" → "close button"; **Closeable** says the surface fires `close`, but the
  file-upload rejected row fires nothing — reword.
- `addToast` id, c-popover's accessible name with a slotted heading, c-tabs arrow names: see `verify-d13-4x.md`.
