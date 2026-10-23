# Releasing csc-ui 4.0.0 stable (leaving changesets pre mode `alpha`)

## Context

`@cscfi/csc-ui` + `@cscfi/csc-ui-react` are at `4.0.0-alpha.32` on npm (`alpha` dist-tag); `latest` is still
`3.0.19` (Stencil era). The repo is in changesets pre mode (`.changeset/pre.json`, 131 changesets consumed).
Leaving alpha freezes the public API under semver until 5.0, so this is the last cheap chance to break things.
A grilling session (2026-10-22) decided what must happen before `changeset pre exit`.

Glossary terms already added to `CONTEXT.md` during the session (before plan mode): **Public API**,
**Value events**, **Commit**, **Internal event**, **Supported browsers**, **Chromium-only spec**; **Kebab-case
twin** marked retired; Value control / Number field / Dropdown / Autocomplete / Tree select / Date picker
entries and the example dialogue updated to the new event vocabulary.

## Decisions

### D1 — The semver contract = manifest + exports (ADR to write)
Public API: everything `custom-elements.json` publishes per tag (tag, attributes/props with types and built-in
defaults, events, slots, parts, CSS states, methods), `texts` keys, exported TS types, `css/*` files, semantic
token names. Breaking = remove / rename / narrow any of it, or change a built-in default. Not public: shadow DOM
structure, internal classes, internal events, pixel appearance, default `texts` strings.
Enforcement builds on the existing **API snapshot** (`packages/csc-ui/src/api-snapshot.node.spec.ts`, per-tag
`api.snapshot.json`).

### D2 — Remove every camelCase event in 4.0.0 (ADR: supersedes ADR-0021, amends ADR-0017)
`changeValue`, `itemChange`, `tabChange`, `tabFocus`, `selectOption`, `dropdownStateChange`, `contentChange`
and their kebab-case twins are gone. Twin dispatch in `useHostEmit` / the shared dispatch paths is deleted.

### D3 — One value-event vocabulary, native timing
Every value control: `input` (no detail) + `update:value` (value) on every value change; `change` (value as
detail) on every commit — Enter/blur for typed text, each pick, release ending a drag.
Behaviour changes this implies:
- Add `change` (value detail) to c-select, c-modal, c-otp-input, c-pagination, c-radio-group, c-slider, c-tabs.
- `change` gains a value detail on c-text-field, c-checkbox, c-switch, c-autocomplete (currently void re-dispatch).
- c-number-field `change` moves from every keystroke to commit.
- c-slider `change` fires once on release (not per move).

Migration advice is per flavor, because Vue templates can never hear `update:value` (runtime-dom skips every
`onUpdate:` listener on an element — `isModelListener`, ADR-0017):
- **Vue:** `v-model` (+ `watch`) for live values; `@input` reading `$event.target.value` for per-change side effects
  (the host's `value` is current when `input` fires — it is what `v-model` reads); `@change` (`$event.detail`) for
  commits. MyCSC's `@change-value` handlers migrate to one of these, never to `@update:value`.
- **Vanilla / Angular / React:** `update:value` / `onUpdateValue` (detail) or `input` for live values; `change` /
  `onChange` for commits.
- **Guard:** a lint rule fails any `@update:*` listener on a `c-*` element in Vue templates (docs canons, usage.md
  snippets); the migration guide offers MyCSC the same rule as a snippet. No new event is added.

### D4 — Non-value events
- c-side-navigation-item `itemChange` → `select` with detail `{ value }` and a new `value` prop, like c-menu
  (D17 #8); c-sub-navigation-item gains the same `select` here (D17 #27).
- Child→parent wiring (`tabChange`, `tabFocus`, `contentChange`, `selectOption`, `dropdownStateChange`) →
  lowercase **internal events**: an `@internal` event-map tag the analyzer honours, so they leave the manifest,
  the React wrapper and the contract.

### D5 — Full manifest audit before pre exit
Three read-only audits (value controls / overlays+nav / layout+display+exports) running; findings land in the
scratchpad (`api-audit-*.md`) for triage. Accepted findings become break-now work items + migration-guide entries.

### D6 — Supported browsers, enforced in CI (ADR: amends ADR-0049)
Matrix: current + previous Chrome/Edge, Firefox, Safari (incl. iOS) + Firefox ESR 140 (RHEL 9). Published in the
docs and `browserslist`. CI browser project gains Playwright Firefox + WebKit instances running behaviour specs;
visual comparison stays Chromium-only; local devcontainer runs stay Chromium (arm64).
Gate: component bugs on any engine block 4.0.0; a spec may skip Firefox/WebKit only via one
`chromiumOnly(reason)` helper (tooling limits like CDP touch), counted/listed by a guard, never on conformance suites.

### D7 — Curated 4.0.0 changelog entry
Before `pre exit`: delete the changeset files already released in an alpha (text stays in the alpha CHANGELOG
sections) and add one hand-written major changeset — first stable release of the rewrite, highlights, breaking
changes since alpha.32, migration-guide link. Changesets added after alpha.32 stay.

### D8 — RC phase gated on MyCSC
Land D2–D6 + accepted audit fixes as alphas, then switch the pre tag to `rc` (`4.0.0-rc.N`). No API change after
rc.1 (enforced by D10). Exit criterion: MyCSC fully migrated onto the latest RC (open sweep items closed — autocomplete
port, rel, z-index, color — e2e green) with no open csc-ui blocker. Then `changeset pre exit`.

### D9 — 3.x frozen
No further 3.x releases (`legacy-main`'s 3.0.20 stays unpublished). `npm dist-tag add @cscfi/csc-ui@3.0.19 v3`
(+ react `3.0.19`); README + migration guide say "unsupported since 4.0.0"; no npm deprecation of 3.x versions.
After 4.0.0: `npm dist-tag rm … alpha` (and `rc`). Deprecate `@cscfi/csc-ui-vue` + `@cscfi/csc-ui-vue2` on npm
(they are not deprecated today, contrary to CONTEXT.md).

### D10 — API-snapshot guard before rc.1
A guard diffs each changed `api.snapshot.json` against the base branch: added = minor; removed / renamed / type
changed other than union-widened / built-in default changed = breaking. Breaking requires a `major` changeset; in
pre mode (rc) any breaking diff fails. Hooks into `changeset-check.yml`.

### D11 — No boolean prop defaults to `true`
`valid` (default true, read as `!props.valid` at `c-input/CInput.vue:444`, so the attribute `valid="false"` is a
truthy string and shows no error) → `invalid` (default false) on all 14 tags (c-autocomplete, c-checkbox,
c-color-picker, c-date-picker, c-file-upload, c-input, c-message, c-number-field, c-otp-input, c-radio-group,
c-select, c-text-field, c-time-picker, c-tree-select). c-loader `visible` → `hide` (its 3.x name; drop `show()`/
`hide()`). `focusable` → internal wiring on both side-navigation items. `docs:manifest:strict` fails any boolean with a `true`
built-in default. Migration-guide entry: `:valid="x"` → `:invalid="!x"`.

### D12 — All break-now audit findings land before rc.1
> Amended by **D17**: where `_plan/csc-ui-4-api-audit/decisions.md` disagrees with this section, it wins.

Accepted in full (details + file:line in the three agent reports):
- **Internal surface:** a tag-level `@internal` (c-dropdown, c-input → also drops `CInput` from the React package;
  replaces the three hand-kept internal-tag lists — docs, example-parity script, React generator — with one
  generated list). Parent-set props → internal: c-tab/-item/-items/-buttons `active`/`value`/`disableAnimation`
  (c-tab-buttons' standalone value API retires, ADR-0023), c-step `current`/`complete`, c-list-item
  `disabled-by-parent`; delete c-tab `host-id`/`position`/`setsize`. c-menu-item `openSubmenu`/`closeSubmenu`/
  `isSubmenuOpen` → `_`-prefixed. Self-assigned slots (c-breadcrumb `first`/`folded`, side-nav-item `sub-item`)
  hidden via an internal-slot marker. Drop `migratedTags`/`tailwindVariantTags` from `src/index.ts`.
- **Bugs & dead API:** c-toasts forwards c-toast's parts as `toast-*` (exportparts) and emits `close`; decide
  standalone c-toast support. c-otp-input: one value shape across prop / `update:value` / host property;
  `completion` typed `string`. c-radio's composed `change` stops at c-radio-group (no double `change`).
  c-pagination: delete `textOverrides`, add `texts: CPaginationTexts` (defaultable). c-table `updateMobileLabels()`
  into the manifest + element type. Remove `reset()` from c-select/c-autocomplete. c-slider: numeric props typed
  `number`, delete `aria-label-internal`. Delete c-message `input-id`, color-picker `separator` part.
  `target` default `''` on c-button + c-list-item. c-side-navigation-item `select` detail typed like c-menu's.
- **Glossary renames:** c-alert `dismissible`/`dismiss` → `closeable`/`close`; c-accordion-item slot `header` →
  `heading`; `CToastMessage.title` → `heading`; c-select part `menu` → `panel`; c-checkbox `label`/`content` parts
  per ADR-0022; color-picker `color-chip` part renamed; c-side-navigation `menu-visible`/`change:menu-visible` →
  `open`/`change:open` (also fire it when c-navigation-button toggles); `host-name` → `name` (c-checkbox, c-slider);
  data-table texts `selectAllItems` → `selectAllRows`; `CAlertIconType` renamed; c-loader `contentdelay` →
  `content-delay` in ms.
- **ADR-0006:** remove c-side-navigation `styles` and c-link `weight`.

### D13 — Consider tier: the additive-path rule (verified, see D17)
Rule: fix before rc.1 whatever has no clean additive path or was named only in the alphas; defer to 4.x (add the
new name, deprecate the old, remove in 5.0) the 3.x names in wide use. Numbers refer to `decisions.md`.

**Before rc.1:**
- Tokens: remove `--c-ring`/`ring` (unused; also CONTEXT.md, ADR-0010, `customization.ts`, `audit-contrast.mjs`)
  and the Stencil-era `--c-text-*` / `--c-transparent` (move CPagination / CNavigationButton to `on-surface-muted`,
  delete `src/tailwind.css:144`, guide line). `--c-icon-color` → private `--_c-icon-color` (#16).
- Internal wiring: c-accordion-item `collapsable`/`outlined`, c-list-item-title `active`, c-button `no-ripple`;
  c-accordion-item `expanded` only after a `:state(expanded)` replaces it in the custom-style canon (#18).
- c-data-table: `change:selected` detail `string[]` + read-only `selectedRows` (#19); `filter` → `query` (#20).
- c-menu-item: `icon` slot (drop `active-icon`); `type: 'command' | 'radio'` + `checked` replace `active` (#22).
- Parts: c-login-button `title`, c-menu-item `submenu`, c-side-navigation-title `label` (holds a heading),
  c-time-picker `end-tab`, list rows → `option` everywhere (#23), color-picker `color-chip` → `value-color` (#11).
- Texts keys: c-tree-select `select` → `selectBranch`, `step` → `levelCounter` (#24); c-number-field
  `increase`/`decrease` to match its parts; c-file-upload `waiting` → `queued`, `dismiss` → `close`.
- Types: `CPlacement` → `CMenuPosition` / `CPopoverPosition` / `CTooltipPosition` (#25); package-level
  `Family`/`ThemeMode`/`AppDefaults`… get the `C` prefix and the entry snapshot guards exported type names; export
  the accordion value type; stop exporting the 30 `C*Props` types (#27).
- Narrowing / defaults: `number | string` → `number` on c-menu/c-popover/c-tooltip/c-steps (keep the runtime
  `Number()` coercion); c-menu `select` detail typed; c-slider `unit` default `'%'` → `''` (guide: add `unit="%"`);
  c-progress-circle `width` → `thickness`; c-alert's neutral member spelled like c-status's.
- Behaviour: c-option `selected` seeds silently, once, while the value is empty (#26); c-pagination stops leaking
  its inner menu's `select`; c-progress-bar `label` becomes the accessible name; c-checkbox/c-switch `checked` is
  the boolean view of `value` (#34); c-navigation-button gets an accessible name via `texts.label`; c-tabs
  overflow arrows get names; `addToast` returns its id synchronously; c-sub-navigation-item drops ", Current page".
- Kept (items dropped after verification): c-modal `dismissable` (glossary **Dismissable**); `mobile` /
  `mobile-breakpoint` / `updateMobileLabels()` (grandfathered; glossary list corrected); c-tooltip `content` slot
  (ADR-0033); c-pagination / c-progress-bar `hide-details` / `hide-range` / `simple` ("`hide-<part>`" rule).

**4.x: add + deprecate, remove in 5.0:** c-button/c-icon-button `outlined`/`ghost`/`text` → `appearance` (#29);
field `hide-details` → `hide-message` (#30); c-spinner/c-loader `width` → `thickness` (#31); c-toasts
`vertical`/`horizontal`/`absolute` → `position` (#32); c-side-navigation-item `active` → `current` + `expanded`
(#33); c-card `fullscreen` → `show-fullscreen`; c-slider `labels` → `tick-labels`. Each new prop has no built-in
default and wins over the old one when set.
Deprecation mechanism (#36): `@deprecated` → manifest `deprecated` → IDE data + React JSDoc. No runtime warning:
there is no dev build, and the example smoke fails on any `console.warn`.

**4.x additive only:** `texts` for the fixed English strings (side-nav, toast, tabs, tab-buttons, steps, alert,
card); text-family `label`/`message`/`root`/`input` parts; c-text-field `min`/`max` accepting date strings;
c-otp-input `disabled` + `texts`; side-nav `autoheight` class → a prop (#35); c-tabs arrow parts; c-popover
`heading` slot. Deferred design: c-list-item `ripple` (it also controls focusability).

### D14 — Accessibility gate: axe in the example smoke
`packages/csc-ui-documentation/tests/examples.spec.ts` runs axe-core (WCAG 2.1 AA) on every canon in light and
dark; zero violations required for rc.1. Real violations get fixed; a rule wrong for a shadow-DOM pattern may be
disabled only per rule with a stated reason — no per-canon opt-outs.

### D15 — React wrapper + TypeScript flavor verified
A React flavor of the example smoke (React 19, built `@cscfi/csc-ui-react`, clean upgrade, no console errors) over
every `.react.tsx` canon; event-mapping specs per event kind (value events, `change:<prop>`, `select`) proving the
`@lit/react` mapping delivers the typed detail (`onChange` is already mapped via the `events` map, e.g. CDatePicker).
Also mount the `.typescript.html` canons. Angular stays type-checked only.

### D16 — Docs
Migration guide (`app/content/migration.ts`) rewritten for every breaking change above. `usage.md` for the 15
standalone tags without one (empty manifest descriptions — c-data-table, c-slider, c-otp-input, c-tabs,
c-pagination, c-steps, c-navigation-button, …). Supported-browsers statement on Getting started. Fix the core
`package.json` description ("Vue 3-based replacement for…"). README: 3.x unsupported since 4.0.0, `@v3` tag.
3.x docs: build once from `legacy-main`, host as a static snapshot (e.g. `design-system.csc.fi/v3/`) with an
"unsupported — see the migration guide" banner; linked from the migration guide and footer.

### D17 — Verification corrections (2026-10-23)
A read-only check of all 124 D11–D13 items against source, glossary, ADRs, usage.md, the migration guide and Stencil
3.x flagged 55 (`_plan/csc-ui-4-api-audit/verify-*.md`). Decisions, with every resolution, are in
`_plan/csc-ui-4-api-audit/decisions.md`; the cross-cutting ones:
- **R1** — restore the 3.x / native attribute names the alphas replaced: `autofocus`, `autocapitalize`,
  `aria-label` (forwarded; drop `aria-label-internal`), c-loader `hide`. Delete `host-id` / `element-id`; `id` stays
  on the host. Fix c-otp-input overwriting the host `id`; give c-otp-input its first spec.
- **R2** — clean break, no aliases, and a migration-guide completeness guard over 3.x API data generated from the
  Stencil readmes (attribute / type / default per prop, events, methods, slots, parts, CSS props): every 3.x name
  that is gone or whose default or type changed needs a guide entry. A first diff found 22 removed attributes and
  2 removed tags the guide never mentions. ADR-0027 amendment.
- **Ledger — same-name behaviour changes** (invisible to the guard: name, type and default unchanged). Each PR that
  makes one adds its guide entry (a `meaningChanged` entry in `migration-api.ts`); tick it here. Entries marked *(check)* need the 3.x behaviour confirmed first.
  - [ ] c-otp-input `value`: the digits typed so far, `''` when empty (3.x: `null` until complete).
  - [ ] `id` on the 11 tags that forwarded it: stays on the host (3.x: set on the inner control).
  - [ ] c-option `selected`: seeds silently, once, while the value is empty (3.x c-select emitted `changeValue`).
  - [ ] Value events fire only on user interaction, never on a programmatic `value` (*check* each 3.x tag).
  - [ ] c-slider: `change` fires once on release (3.x `changeValue` fired on every move).
  - [ ] c-pagination `value`: `{ page, pageSize, … }` and a new object per change (3.x: `CPaginationOptions`
        mutated in place) — same prop name and type name, so the guard cannot see it.
  - [ ] c-checkbox / c-switch `checked`: the boolean view of `value` (*check* 3.x precedence).
  - [ ] c-radio `change` no longer escapes c-radio-group (*check* whether 3.x c-radio's event bubbled).
  - [ ] `change` on c-text-field / c-checkbox / c-switch / c-autocomplete carries the value (*check* what 3.x
        consumers could hear as `change`).
  - [ ] `hidden` on a `c-*` host hides it (*check* 3.x).
  - [ ] c-data-table `change:selected` detail is `string[]` (if 3.x had the event under another name, the guard
        covers the name; the detail change goes here).
- **R3** — c-pagination's value becomes `{ page, pageSize, … }` before rc.1, emitted as a new object.

## Work, in order

Every PR to `main` carries its own changeset (major for breaking items while in pre mode → next alpha); MyCSC can
start migrating on the first alpha that carries D2–D4.

0. **Infrastructure first** (so later work is checked as it lands)
   - **Done (67a3e096)** — Analyzer: `@internal` for tags, props, events, slots, methods (`packages/csc-ui/scripts/analyzer/`; reuse the
     `_`-prefix handling at `script-api.mjs:284`); one generated internal-tag list consumed by docs, the example-parity
     script and `packages/csc-ui-react/scripts/generate.mjs`. The strict no-default-`true`-boolean rule lands
     with D11 in phase 2 (it would fail the build until `valid`/`visible`/`focusable` change).
   - **Done (2026-10-23)** — Docs guard (R2): `scripts/extract-v3-api.mjs` wrote `scripts/v3-api.json` from the
     72 tags' readmes at `v3.0.19` (identical to `legacy-main`'s); `scripts/check-migration-guide.mjs`
     (`pnpm lint:migration`, in `lint:guards` and CI) fails when a 3.x name that is gone, or whose default or type
     changed, has no entry in `app/content/migration-api.ts`, which the migration page renders as "3.x API, name
     by name". It also fails stale entries. 75 names wait in `scripts/migration-guide-baseline.json`, which may
     only shrink and must be empty once the pre tag leaves `alpha`. Who writes them (decided 2026-10-23, hybrid):
     the ~30 names phases 1–2 still change go with their PRs, the ~45 already-final ones in one phase-3 batch.
   - **Done (2026-10-23)** — Lint: `@update:*` on a `c-*` element in a Vue template is an error (D3): a
     `vue/no-restricted-syntax` selector in `eslint.config.ts` (`.vue` files: SFCs, canons, the docs app) plus the
     example-parity script for the ```vue snippets in usage.md (which also gained the canons' `.prop` check). The
     migration guide's copy of the rule for MyCSC lands with phase 1's event rewrite.
   - **Done (2026-10-23)** — API-snapshot breaking-change guard (D10), armed by pre tag: `alpha` → needs a major
     changeset, `rc` → fail; outside pre mode an addition needs at least a minor one.
     `packages/csc-ui/scripts/check-api-breaks.mjs` (`pnpm ui lint:api`, a step in `changeset-check.yml`) diffs the
     snapshots from the merge base; the entry snapshot now records each exported type's shape, so `texts` keys and
     alias unions are guarded. Its first run caught 67a3e096: `internal-tags.md` became a major changeset.
   - CI: Firefox + WebKit instances in the browser project (`packages/csc-ui/vitest.browser.config.ts`,
     `.github/workflows/ci.yml` installs them), `chromiumOnly(reason)` helper + guard; fix what they surface.
   - Example smoke: axe (D14), React + TypeScript flavors (D15).
1. **Events** — D2–D4: delete twin dispatch (shared emit helpers / `useHostEmit`), add/align `change`, internal
   wiring events, side-nav `select`; regenerate the React wrapper; update docs canons (all four flavors) and the
   docs site's own `@item-change` bindings (`app/app.vue`).
2. **API fixes** — D11, D12, D13 "before rc.1", D17, in themed PRs (internal surface → bugs → renames → tokens/types).
   Each rename also updates canons in all four flavors, usage.md and the migration guide. A PR that changes a name in
   `scripts/migration-guide-baseline.json` writes its `migration-api.ts` entry and drops it from the baseline (the
   guard forces the drop only when the name stops being flagged, e.g. a restored `autofocus`; a name that stays
   flagged, like the forwarded `id`, is on the PR author — and on the ledger when its meaning changes). Phase-1
   events (`itemChange`, `tabChange`, `tabFocus`, c-steps `changeValue`) likewise. Open question the guard surfaced:
   the manifest lists no `value` attribute on c-select, c-autocomplete and c-accordion (object-capable types),
   though Vue still observes it — either the analyzer lists it (3.x had it) or the guide says to set the property.
3. **Docs** — D16 (migration guide can grow with each PR in 1–2; the rest here). One batch writes the baseline's
   already-final names (~45): the 18 c-data-table 3.x props, events and methods mapped onto `selection` / `sort` /
   `page` / `texts`; c-menu `content-class`/`custom`/`flat`/`items-per-page`/`small` and `c-menu-items`; c-modal
   `z-index`; c-tag `block`/`fit`; c-radio-group `color`/`items`/`return-object` and its narrowed `value` type; c-radio `checked`; c-button
   `grouped`/`tabs`; c-tab-buttons `tabs`; `hostDisabled` (c-switch, c-tab-buttons); c-switch `label` slot; c-page
   `default` slot; `c-text-field-open`; c-otp-input `reset()`; c-text-field `type`/`autocorrect`; c-spinner `color`.
   The baseline is empty before phase 4.
4. **RC** — switch pre tag `alpha` → `rc` (verify the changesets CLI sequence: `pre exit` + `pre enter rc` before a
   version run), publish `4.0.0-rc.1`. From here: fixes only, API guard fails any breaking diff.
   Gate (D8): MyCSC fully migrated on the latest RC, e2e green, no open csc-ui blocker.
5. **4.0.0** — D7 curated changeset (delete changesets already released in an alpha, add the hand-written major),
   `changeset pre exit`, merge the version PR → publish via `release.yml`. Then D9: `v3` dist-tag on 3.0.19 (both
   packages), remove `alpha`/`rc` dist-tags, `npm deprecate` `@cscfi/csc-ui-vue` + `@cscfi/csc-ui-vue2`, publish the
   v3 docs archive.
6. **4.x follow-ups** — deprecation mechanism, then the D13 "4.x" lists; removals queued for 5.0.

## ADRs and glossary follow-ups (written during phase 0–1)

- **ADR-0074** The public API is the manifest plus the package exports — D1, D10, and the evolution rule from D13
  (add + deprecate in a minor, remove in a major).
- **ADR-0075** Events are all-lowercase; value events follow native timing — D2–D4; supersedes ADR-0021, amends
  ADR-0017 (grandfather clause gone), introduces internal events.
- **ADR-0076** No boolean prop defaults to true — D11 (`invalid`, `hide`).
- **ADR-0027 amendment** What an upgrade can rely on — D17 R1/R2 (written 2026-10-23).
- **ADR-0077** Supported browsers; behaviour specs on three engines, visuals on Chromium — D6; amends ADR-0049
  (also records D14 axe and D15 flavor smokes as part of the verification layer).
- Amend ADR-0027/0028: RC phase, 3.x frozen with a `v3` dist-tag, curated 4.0.0 changelog (D7–D9).
- `CONTEXT.md` (already updated: Public API, Value events, Commit, Internal event, Supported browsers,
  Chromium-only spec, Kebab-case twin retired). Still to do: **Value events** gains "a Vue template cannot hear
  `update:value` (ADR-0017); it binds `v-model`, `@input` + the host's `value`, or `@change`", and the example
  dialogue's live-value answer says the same; generalise **Internal event** to cover internal tags,
  props, slots and methods; `invalid` wherever validity is described; correct
  the `mobile` grandfathered list (D13); **Example smoke** gains axe + React/TypeScript flavors; mark c-dropdown and
  c-input as internal tags; CONTEXT.md's claim that `@cscfi/csc-ui-vue(2)` are deprecated becomes true at phase 5.
- On leaving plan mode: copy this plan to `_plan/csc-ui-4-stable-release.md` and the three audit reports to
  `_plan/csc-ui-4-api-audit/` (they live in `~/.claude/plans/rustling-soaring-book-agent-*.md` today).

## Verification

- CI green on Chromium, Firefox and WebKit; the `chromiumOnly` guard lists every skip with its reason.
- API-snapshot guard: a fixture PR that removes a prop fails without a major changeset (alpha) and always fails (rc).
- The migration-guide guard fails when a gone 3.x name or a changed 3.x default has no entry (delete the `target`
  entry to see it fail), and passes on the finished guide; every ledger line is ticked before rc.1.
- The `@update:*` lint fails a fixture `<c-text-field @update:value="…">` in a Vue template; a Vue canon using
  `@input="fn($event.target.value)"` receives every keystroke's value in the example smoke.
- `docs:manifest:strict` fails a fixture prop `boolean = true`; manifest + React wrapper contain no camelCase event,
  no internal tag/prop/event/slot (`grep -E '"[a-z]+[A-Z]' api.snapshot.json` over events is empty).
- Example smokes: Vue, React and TypeScript flavors mount cleanly; axe reports zero violations in both modes.
- MyCSC on the latest RC: migration sweep items closed, e2e green (D8 gate).
- After publishing: `npm view @cscfi/csc-ui dist-tags` → `latest: 4.0.0`, `v3: 3.0.19`, no `alpha`/`rc` (same for
  `-react`); `npm view @cscfi/csc-ui-vue deprecated` non-empty; the 4.0.0 CHANGELOG entry is the curated one;
  a vanilla HTML page loading `dist/csc-ui.js` from the published tarball upgrades every tag.
