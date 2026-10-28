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
  - [x] c-otp-input `value`: the digits typed so far, `''` when empty. No entry: 3.x's `value` already held them;
        only `changeValue` was `null` until complete, and its entry says so (phase 1).
  - [x] `id` on the 11 tags that forwarded it: stays on the host (3.x: set on the inner control). The guard
        flags it (property `hostId` gone), so each tag's `id` entry says so (R1 commit).
  - [x] c-option `selected`: seeds silently, once, while the value is empty (3.x c-select emitted `changeValue`)
        — `meaningChanged` entry (d9d71773).
  - [x] Value events fire only on user interaction, never on a programmatic `value`. 3.x emitted on a set
        `value` in c-accordion, c-tabs and c-pagination (and c-select's seed, c-tab-buttons' standalone use):
        each one's entry says so (c-accordion folds it into its `value` entry, c-tabs is `meaningChanged`).
  - [x] c-slider: `change` fires once on release (3.x `changeValue` fired on every move) — in the c-slider
        `changeValue` entry (phase 1).
  - [x] c-pagination `value`: `{ page, pageSize, … }` and a new object per change (3.x: `CPaginationOptions`
        mutated in place). The guard did flag it after all (the 3.x type differs); its `value` entry says so
        (cdcc47fb).
  - [x] c-checkbox / c-switch `checked`: the boolean view of `value`. 3.x checked the box when `checked` OR
        `value === trueValue`; now a bound `value` wins — `meaningChanged` entries (d9d71773).
  - [x] c-radio `change` no longer escapes c-radio-group. No entry: 3.x c-radio declared no event, and its
        inner input's native `change` stayed in its shadow root (phase 1 made the wiring event internal).
  - [x] `change` on c-text-field / c-checkbox / c-switch / c-autocomplete carries the value. No entry: 3.x
        rendered them in shadow roots, so the inner input's `change` never reached a 3.x consumer (phase 1).
  - [x] `hidden` on a `c-*` host hides it. No entry: 3.x had no `[hidden]` rule either, so `hidden` did not
        hide a Stencil host with its own `:host` display; it now works where it never did.
  - [x] c-data-table `change:selected` detail is `string[]`. No entry here: 3.x had `selection` (a baseline name
        the phase-3 batch maps onto `selected` / `change:selected`), so the guide's entry covers the detail too.
  - [x] c-menu default slot: the items, where 3.x's default slot was the trigger (now `slot="trigger"`). Entry
        (phase 3).
  - [x] c-modal `dismissable` also governed Escape (3.x closed every modal on Escape). User decided 2026-10-27:
        Escape closes every modal again, `dismissable` governs the backdrop only (ADR-0014 amendment); no entry.
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
   - **Done locally (2026-10-23); WebKit waits for the first pushed CI run** — CI: Firefox + WebKit.
     `TEST_BROWSERS` (comma-separated, Chromium alone when unset) adds the `browser (firefox)` and
     `browser (webkit)` instances to the csc-ui browser project (`vitest.browser.shared.ts`); CI runs them in a
     separate `engines` matrix job, one runner per engine, which builds first for the dist smoke. Visual baselines
     compare on Chromium only. `chromiumOnly(reason)` in the harness plus `lint:engines` (in `lint:guards`); one use
     so far, the page-lock touch-pan test (desktop Firefox has no `Touch` constructor). The docs example smoke stays
     on Chromium. The first Firefox run (Playwright's Firefox 150, from a scratch install in the devcontainer)
     failed 50 of 1467 tests; now 51/51 files pass:
     - Fonts: Firefox's content sandbox could not read the bundled Liberation files, so everything fell back to
       DejaVu, about 15% wider (c-card-title, c-breadcrumb and an overlay case failed). Fixed with the sandbox
       read-path pref.
     - Bug, fixed: a `range` date/time picker's dash sat off centre where `field-sizing` is missing (ESR too);
       the start is now measured in its own font.
     - Test bug: a `CSSStyleRule` is a `CSSGroupingRule` in Firefox (the side-nav `dvh` check skipped it).
     - Style queries (Firefox 151+, missing in ESR 140 and in Playwright's 150) — decided: the spec probes the
       capability and asserts ADR-0054's inert inverting scope where it is missing.
     - Firefox's native anchor positioning neither shifts a panel no placement fits back into the viewport
       (Bug 1924792) nor keeps the last placement that fit — decided: where its native panel runs off the viewport,
       the fallback is held to the shift itself. A too-tall c-popover still runs off-screen on current Firefox.
     Open: WebKit has never run (its system libraries are missing in the arm64 devcontainer); the first CI run
     shows what it surfaces, fonts included. `main` is protected but requires no status check at all (GitHub API,
     2026-10-23: enforcement off, no contexts, no rulesets), so today no failing job blocks a merge, not even
     `build-lint-test` or `require-changeset`. Make all four required once the engine jobs have reported once:
     `build-lint-test`, `Behaviour specs (firefox)`, `Behaviour specs (webkit)`, `require-changeset`.
     iOS Safari stays untested: CI's WebKit is WebKitGTK, without iOS touch
     scrolling, keyboard or visual viewport — a known gap, no device check (decided 2026-10-23).
   - **Done (2026-10-23)** — Example smoke: axe (D14), React + TypeScript flavors (D15). The docs smoke now runs
     the 160 Vue canons with axe (WCAG 2.1 AA, light and dark), the 159 `.react.tsx` canons on React 19 through the
     built wrapper, the 159 `.typescript.html` fragments with their wiring, and a manifest-generated spec that every
     event's `on<Event>` prop receives the detail. `tests/axe-baseline.json` lists the rules still failing per canon
     (101 canons, 123 canon-rule pairs); it may only shrink and must be empty once the pre tag leaves `alpha`.
     The React flavor surfaced a wrapper bug, fixed on the way: `@lit/react` sets a prop as a property only when
     the element class's prototype names it, Vue defines props on the instance, so arrays, objects and functions
     reached the element as `[object Object]` attributes (the generator now lists each tag's properties).
     What the axe baseline holds, for phase 2:
     - **Contrast (80 canons) — decided 2026-10-23: propose `tertiary-600` to design.** Light `on-surface-muted` /
       `on-surface-faint` are both `tertiary-500` (`#7e888d`: 3.62:1 on white, 3.18:1 on `surface-muted`). The
       proposal: both → `tertiary-600` (`#5e6a71`: 5.56:1 / 4.87:1; `border-strong` already uses it). It lands in
       phase 2 once design approves; D14 stays exception-free. These are the only 2 of the contrast audit's ten
       below-AA pairs that axe flags today; the other 8 (white on `accent` / `success` / `info` / `warning`,
       `on-accent-subtle`, nav hover) appear in no canon state axe sees (hover never), so they go to design as
       context but do not block rc.1 unless a canon starts showing one. Axe's other failing pairs are not in the
       audit (it checks light-mode token pairs only) and are ours to fix: dark `#5e6a71` on `#2b2f33` (data
       table / pagination meta), white on `#c4dee4` (side-nav title / item), the colored login card's field
       label, accordion custom colours in dark, c-message error red in dark.
     - **Fields lose their label (high):** c-text-field / c-number-field (and the other fields on c-input) render
       the `<input id>` in their own shadow root and slot it into c-input, whose `<label for>` sits in c-input's
       shadow root — `for` never leaves its tree, so the visible label does not name the input (axe `label` on
       12 canons, including those that set `label`). Name the input from the label across the boundary
       (`aria-label` from the prop, or move the label next to the input), then check every c-input field.
     - **Canon faults:** c-icon-button and c-navigation-button canons give no accessible name (`button-name`;
       c-navigation-button's `texts.label` is D17 #27).
1. **Events** — D2–D4: delete twin dispatch (shared emit helpers / `useHostEmit`), add/align `change`, internal
   wiring events, side-nav `select`; regenerate the React wrapper; update docs canons (all four flavors) and the
   docs site's own `@item-change` bindings (`app/app.vue`).
   **Done locally (2026-10-26): ba39ece8, 8bab4d4d, ab622392, 735fe84d, acb5fd3e.**
   - **Internal wiring events (ba39ece8).** c-tab `tabchange`/`tabfocus`, c-tab-buttons `tabchange`, c-tab-item
     `contentchange`, c-accordion-item `itemchange` (it was public `item-change`, the same kind of event), c-radio
     `radioselect`: lowercase, `@internal`, stopped at the parent. c-dropdown's events no longer leave c-select's
     shadow root. The tag map's generated `INTERNAL_EVENTS` backs a conformance check that none reaches the page.
     Fixed on the way: a nested accordion's item toggled the outer accordion too.
   - **Value events (8bab4d4d).** `emitModelValue` is gone; `valueEvents.ts` has `emitModelChange` (a pick: `update:value`,
     `input`, then `change`, in native order), `emitModelInput` (a keystroke or drag move) and `emitModelSettled`
     (the commit). **`change` never bubbles** (decided 2026-10-26: a field inside an accordion, modal or tab panel
     would reach the container's `change` with a foreign detail); `input` bubbles. Typed text commits on Enter or
     leaving the field, and only when it changed since the last commit (c-text-field through the inner input's
     native `change`; c-number-field and c-otp-input track their own commit, since the number field's conform
     rewrites the text). c-number-field: key steps and click steps commit at once, a held step button on release.
     c-otp-input: one value shape, the digits so far (D17 #4); `completion` typed `string`. The conformance recipe
     gained a `commit` step for typed text. Fixed on the way: c-modal's double emission (both KNOWN lists lose it)
     and c-tabs' double emission on Enter.
   - Angular templates cannot bind colon-named events, so the Angular canons follow typed text with `(input)`
     reading `$event.target.value` and picks with `(change)`; the migration guide's binding section now says so
     (it used to suggest `(change:sort)`) and offers MyCSC the ESLint rule for `@update:*` and the retired names.
   - **Side navigation `select` (ab622392).** c-side-navigation-item `itemChange` → `select` with `{ value }` and a
     new `value` prop (D17 #8); c-sub-navigation-item gains both (#27), so its canons drop click + keyup pairs.
     Both bubble; c-side-navigation ignores sub-items' events, and a nested item no longer swallows its own. The
     docs site's navigation listens once on c-side-navigation.
   - **Twins gone (735fe84d).** `useHostEmit` dispatches one event; the strict analyzer fails any event name that
     is not all-lowercase. Manifest and React wrapper hold no camelCase event (verified).
   - **One `input` per value change (acb5fd3e)** (decided 2026-10-26). A native `input` is `composed`: text and number fields
     sent two per keystroke, the pickers one per keystroke of uncommitted text. `defineElement` now stops a native
     `input` that started in a component's own shadow tree at its shadow root; a page's input slotted into a
     component still reaches the page. The value-control conformance suite counts every `input` reaching the page.
   - Left for phase 2: c-pagination still emits on mount and on a set `value` (KNOWN_PROGRAMMATIC_EMITTERS; R3
     rewrites its value), c-option `selected` seeding (#26), c-checkbox/c-switch reading `''` as checked.
2. **API fixes** — D11, D12, D13 "before rc.1", D17, in themed PRs (internal surface → bugs → renames → tokens/types).
   Each rename also updates canons in all four flavors, usage.md and the migration guide. A PR that changes a name in
   `scripts/migration-guide-baseline.json` writes its `migration-api.ts` entry and drops it from the baseline (the
   guard forces the drop only when the name stops being flagged, e.g. a restored `autofocus`; a name that stays
   flagged, like the forwarded `id`, is on the PR author — and on the ledger when its meaning changes). Phase-1
   events (`itemChange`, `tabChange`, `tabFocus`, c-steps `changeValue`) likewise. The open question the guard
   surfaced (no `value` attribute on object-capable types) is decided (2026-10-26): the analyzer lists the
   string/number form (ee79afbf).
   **Done locally (2026-10-26)**, 18 commits after 898b1e4c, each with its changeset; the full Chromium + node suite
   passes (75 files, 2014 tests) and the docs smoke with axe:
   - Internal surface (980729ec): tab family, c-accordion-item `expanded` (now `:state(expanded)`) /
     `collapsable` / `outlined`, c-step, list items, c-button `no-ripple`, nav items' `focusable` → one internal
     `collapsed`; internal slots; `_`-prefixed submenu methods; no `C*Props` / `migratedTags` exports (registry
     moves to `src/registry.ts`; 1334bb47 points its node spec there). c-tabs keeps a consumer-set `id`.
   - Toasts (ffe2644d): c-toast internal, `toast-*` parts, `close` on c-toasts, `addToast` returns the id,
     `title` → `heading`.
   - Values (d9d71773): `<c-option selected>` seeds silently, once; `reset()` gone; c-checkbox/c-switch one state
     (views reconciled in one nextTick pass — a per-watcher deferral looped forever under React); `''` unchecked.
   - R3 (cdcc47fb): c-pagination `{ page, pageSize }`, new object per pick, no programmatic emission, `texts`
     (also via c-data-table's), menu `select` contained, the ellipsis hidden from AT.
   - D11 (948d91c7): `valid` → `invalid` (13 tags), c-loader `hide`, the strict no-true-boolean rule.
   - R1 (4aee2cd7): `autofocus`, `autocapitalize`, `name`, slider `aria-label` restored; `host-id` / `element-id`
     gone, `id` stays on the host; c-otp-input's hidden `reset()` and c-message `input-id` gone.
   - Bugs (9e9ffb8a): `target` `''` + keyboard path, `:host([hidden])`, slider numbers / `unit`, c-table
     `updateMobileLabels()` exposed, progress-bar / nav-button / tab-arrow names, `@internalpart`.
   - Renames (4fc63895, b20fe9d4, e3b90a99, 1aa4ac94, 7b75a71c, 9994f373): c-alert closeable/close, accordion
     `heading` slot, loader `content-delay` (ms), `selectAllRows`; parts (`option`, `panel card`, checkbox `label`,
     `value-color`, …); texts keys; side-nav `open` (+ Enter on the nav button toggled twice — fixed), `styles` /
     c-link `weight` gone; c-menu-item `type` + `checked` + `icon` slot; data-table `change:selected` ids +
     `selectedRows`, `filter` → `query`.
   - Types (4898c0db): `CPlacement` split per overlay, package types `C`-prefixed, exported type names in the entry
     snapshot, `CAccordionValue`, numbers narrowed, progress-circle `thickness`.
   - Tokens (ce1432d7): `ring`, Stencil-era `--c-text-*` / `--c-transparent` gone, `--_c-icon-color` private.
   - A11y (23e6be6d): text/number fields named from `label`, icon-button canons named; the axe baseline lost 19
     canon-rule pairs in phase 2 (slider `aria-valid-attr`, progress-bar, nav-button, data-table separator too).
   Left: the contrast token (design decision pending, `tertiary-600` proposed); the remaining axe baseline
   (contrast, c-tabs `aria-required-children`, data-table selection); the 47 baseline names are phase 3's batch.
3. **Docs** — D16 (migration guide can grow with each PR in 1–2; the rest here). One batch writes the baseline's
   already-final names (~45): the 18 c-data-table 3.x props, events and methods mapped onto `selection` / `sort` /
   `page` / `texts`; c-menu `content-class`/`custom`/`flat`/`items-per-page`/`small` and `c-menu-items`; c-modal
   `z-index`; c-tag `block`/`fit`; c-radio-group `color`/`items`/`return-object` and its narrowed `value` type; c-radio `checked`; c-button
   `grouped`/`tabs`; c-tab-buttons `tabs`; `hostDisabled` (c-switch, c-tab-buttons); c-switch `label` slot; c-page
   `default` slot; `c-text-field-open`; c-otp-input `reset()`; c-text-field `type`/`autocorrect`; c-spinner `color`.
   The baseline is empty before phase 4.
   - **Migration guide — done locally (2026-10-26).** The batch wrote the remaining 44 entries and emptied the
     baseline (534 of 534 changed 3.x names covered). Three of the 47 were guard artifacts, fixed in the guard: it
     compared a prop's 3.x type with the attribute's string form instead of the property (c-select /
     c-autocomplete `value` still take the item object), it did not equate an inline 3.x object type with the
     interface it is, and the extractor kept c-page's slot literally named `default`. Found on the way:
     `autocorrect="off"` turned autocorrection on (a9745b7c fixes it), the data-table column example used
     `value` / `policy` for `header` / `expansion` and a non-generic `CDataTableColumn<User>`, and 3.x sorted
     every column unless told otherwise, where 4.x needs `sortable: true`.
   - **Component descriptions — done locally (2026-10-27).** Every public tag has a usage.md (76 of 79; the three
     without are internal): full docs for the 21 standalone tags that had none, one paragraph for the 19 composed
     children (only a child's first paragraph shows under its API heading), rewrites of the one-line c-link and
     c-loader docs, and a titles/items/sub-items section in c-side-navigation. The docs site now renders a child's
     whole usage.md in its parent's Usage section (c-radio, c-menu-item and c-tab-buttons had prose that never
     showed). Reading every tag against its source turned up ~70 faults, none fixed:
     `_plan/csc-ui-4-usage-doc-findings.md`, with the systemic one first (host `aria-*` attributes reach the
     shadow DOM camelized: `aria-label` on c-icon, `aria-haspopup` on the pickers' icon buttons, `rel` on c-link).
     The migration guide's c-tag `block` / `fit` CSS was wrong (sized only the part) and is corrected.
     Follow-ups the user chose: the attribute fix (7ef09509) and Escape closing every modal (24fe47a4).
   - **Supported browsers — done locally (2026-10-27).** Getting started gains the statement (ADR-0077's matrix);
     both packages carry it as `browserslist` (last 2 Chrome / Edge / Firefox / Safari / iOS + Firefox ESR, which
     resolves to ESR 140), and the page reads the query from the core package.json. The field changes nothing in
     the build: dist is byte-identical with it.
   - **Package and README — done locally (2026-10-27).** The core description no longer calls the package a
     "Vue 3-based replacement"; the core README is rewritten (what it is, frameworks, supported browsers, upgrading
     from 3.x) and `@cscfi/csc-ui-react` gets its first README. Both, and the migration guide's "Before you start",
     say 3.x is unsupported since 4.0.0 with 3.0.19 its last release. They pin with `@3`, not the planned `@v3`
     tag: `@3` already resolves to 3.0.19 on npm, while the `v3` dist-tag only exists after phase 5, so rc
     READMEs would point at a missing tag. Phase 5 still adds the tag.
   - **3.x docs archive — done locally (2026-10-27).** User chose to commit it: `public/v3/` holds the 3.0.19 docs
     (387 files, 4.7 MB, `linguist-generated`), served at `/v3/` by every docs deploy, so phase 5 has nothing left
     to publish for it. `scripts/build-v3-archive.mjs` rebuilds it from the `v3.0.19` tag in a temporary worktree
     (npm `--ignore-scripts`, so the old `husky install` never touches this repo's git config), injects the
     "unsupported" banner and `noindex`, and gives each of the 72 component routes an entry HTML so direct links
     load on any static host. Linked from the migration guide's "Before you start" and a new site footer; the
     prerender crawler, oxfmt and the viewport smoke skip it. The archive loads Highlight.js from a CDN, as the
     3.x site did. Noticed: the 4.x docs toolbar still shows a "next" badge (now `v4`, eebf36f3).
   - **Findings triage, section B (behaviour bugs) — done locally (2026-10-27).** Per D13 the behaviour bugs and
     a11y faults of `_plan/csc-ui-4-usage-doc-findings.md` are before-rc.1 work. Every B item is fixed, each with a
     spec that failed first and a changeset (30bc5c6c..adee0bf6, 13 commits): c-steps, c-accordion,
     c-side-navigation, c-tags/c-tag, c-slider, c-otp-input, c-login-card, c-page, c-card, c-tabs (two commits),
     c-data-table, c-pagination. Every inferred fault reproduced. The serious one: a c-modal in a tab panel got a
     104×16 px backdrop — c-tabs' identity `transform` and the panel track's resting `translate` made them its
     containing block; the track now rests without a transform. Found on the way and fixed: a nested side-nav item
     with `href` never navigated, c-tabs dropped a resize during the indicator's move, c-tab-items matched no
     HTML panel at mount, and the analyzer listed `Alias | null` object props as attributes (c-data-table `sort`,
     the pickers' `value` types; a major changeset for the guard). Left: c-tab-item's undeclared `[disabled]` hook,
     which the slide still reads. Verified: Chromium suite 66 files / 1699 tests, node 435, lint + guards,
     `format:check`, both builds, docs smoke with axe 509/509; the changed specs on Playwright Firefox (two
     Chromium-only specs added: the `Touch` constructor and synthetic paste data are Chromium test tooling). The
     smoke caught a regression of 7ef09509, fixed in d6253feb: ARIA id references copied into the shadow DOM
     dangled. The login-card canons' baselined contrast now reports nothing because axe cannot measure text over
     the image the URL fix restored; the same text stays baselined in c-login-card-content/basic. Next: section C
     (a11y), then the axe baseline.
   - **Findings triage, section C (a11y) — clear-cut items done locally (2026-10-27).** User chose "clear-cut first,
     propose the rest". Fixed, each with a failing-first spec (0d93fadd..fcca2f7a): c-tag a toggle button
     (Enter/Space, `aria-pressed`), c-list-item (Enter/Space on ripple items, link focus ring, `aria-current`, no
     `aria-disabled` on a listitem), c-login-button a native button without `href`, c-steps no empty Tab stop and
     a `role="status"` summary, c-otp-input `aria-required` / `aria-invalid` / described digits (+ `message` part),
     c-data-table row-aware control names (`selectRow` / `expandRow` also take a function), a persistent status
     region and `aria-busy`, c-pagination button names, c-icon-button busy while loading, c-csc-logo an image
     named "CSC", card sections without a nested article or `<menu>` rows. The structural three — c-tabs (APG
     Tabs), c-side-navigation + c-navigation-button (disclosure navigation, modal drawer), card-title headings —
     are proposed in `_plan/csc-ui-4-a11y-structural-proposal.md`. Fixed English strings stay on the 4.x `texts`
     list (D13).
   - **Structural a11y — done locally (2026-10-27).** User picked all three as recommended: card titles are
     headings at a new `heading-level` (default 2; named so because the glossary's **Level** is the tree select's
     depth; 17d17a7b, React 35e64b00); c-tabs follows APG Tabs with manual activation (aca759f9; buttons mode via
     an internal c-button `asTab`; found on the way: arrow focus waited for a transitionend that never fires
     without motion, and a re-measure pulled focus back to the active tab); c-side-navigation follows the
     disclosure navigation pattern with the mobile drawer a modal dialog on the shared modal stack (04cd5740;
     c-navigation-button reports `aria-expanded`). The axe baseline lost every `aria-required-children` entry
     (9 canons). Section C is complete.
   - **Axe baseline — everything but contrast cleared (2026-10-27).** A host `aria-label` on c-checkbox,
     c-switch, c-radio and c-progress-bar now reaches the native control (0885ed53, shared `useControlAttrs`);
     the custom-cells canon names its progress bars and heads its actions column (283bc8d2); a breadcrumb crumb
     element is the `listitem` itself (the `<li>` inside its shadow root had no list). The baseline holds only
     `color-contrast` (78 canons), waiting on the design token decision.
   - **Findings section D — done locally (2026-10-27)**: glossary (expander pins right, c-tag standalone, the
     c-tabs row's scroll input), c-status / c-alert neutral-look descriptions, four seeded prop descriptions,
     and the canon faults (sub-item `select`, c-steps `:value`, c-page wording, c-badge name and token, login
     `alt`, accordion `null`, external-data request race and a stale React closure).
   - **Seeded descriptions — done locally (2026-10-27).** All 181 `@seeded from csc-ui — verify` descriptions
     verified against source and usage.md (three parallel agents, reviewed: JSDoc-only diff), 172 rewritten;
     the analyzer's pending count is 0 (3c8f1360). The pass surfaced, and these were fixed with specs:
     `<c-button type="submit|reset">` did nothing to its form, a 4.x regression from 3.x (195b86ba);
     c-text-field ignored a `type` set after mount (76413966); c-progress-bar's "0 %" tooltip while
     indeterminate, c-steps' out-of-range summary, c-page's indicator stale until a scroll (e8671334..626f3f5d);
     stale usage docs (0694ec4e). Reported, not acted on: c-tabs' scroll-arrow names are fixed English (the 4.x
     `texts` list); c-icon-button's disabled ink is `on-surface-muted` where c-button moved to
     `on-surface-faint`; c-checkbox `indeterminate` stays until the consumer clears it (native clears on click);
     c-switch `loading` neither blocks toggling nor sets `aria-busy`.
4. **RC** — switch pre tag `alpha` → `rc` (verify the changesets CLI sequence: `pre exit` + `pre enter rc` before a
   version run), publish `4.0.0-rc.1`.
   - **CLI sequence verified (2026-10-27, dry run).** In a throwaway worktree, `development` merged onto `main`
     (alpha.32, 128 consumed changesets), then `changeset pre exit` + `changeset pre enter rc` + `changeset version`:
     it works, and keeps every changeset, but versions **`4.0.0-rc.33`**, not rc.1. Changesets takes the next
     prerelease number from the current version's (`alpha.32` → 33) whatever the tag
     (`assemble-release-plan` `getPreVersion`). Getting rc.1 needs a one-time hand edit of both package versions to
     `4.0.0-rc.0` in the PR that enters rc, which CLAUDE.md forbids, so it's the user's call. The plain alpha
     path gives `4.0.0-alpha.33`. **Decided 2026-10-27 (user): reset once to rc.1.** Runbook, on a branch from
     `main` after `development` is merged: `pnpm changeset pre exit`, `pnpm changeset pre enter rc`, set both
     `packages/csc-ui` and `packages/csc-ui-react` `version` to `4.0.0-rc.0` by hand (never published; the one
     documented exception to "never bump by hand"), merge; the release workflow's version run then gives
     `4.0.0-rc.1`. **Dry run done 2026-10-28:** `development` (ce3e904b) merged onto `origin/main` in a throwaway
     worktree (package.json conflict: keep main's version, development's description), then the three steps
     and `changeset version`: both packages `4.0.0-rc.1`, pre.json keeps the 128 consumed changesets and adds
     the 76 new ones. `changeset publish` in pre mode publishes under the `rc` dist-tag (`pnpm run release`
     passes no tag). Two ordering rules: keep the rc-entry PR separate from the development→main merge PR,
     because `check-api-breaks.mjs` reads `pre.json` from the PR head and fails any breaking diff once the tag
     is `rc`; and leave the `alpha.33` "Version packages" PR that the merge opens unmerged, since the rc-entry
     merge rewrites it to `rc.1`.
   - **Contrast brief for design (2026-10-27):** `_plan/csc-ui-4-contrast-brief.md`, the last rc.1 gate in the axe
     baseline (78 examples), measured by pair: light hint ink `tertiary-500` → `tertiary-600` (76 examples; then
     disabled buttons move to `on-surface-disabled`), dark `error` → `error-300`, expanded accordion headings →
     `on-primary-subtle`; the c-main reports are axe misreading the pinned layout.
   - **User decisions 2026-10-27 on the verification pass's reports:** c-switch `loading` matches the buttons
     (done, 6fd1fbf6); c-checkbox `indeterminate` clears on a click or Space, before `change`, natively (done, ebbbc0c4; a binding writes it only when its value changes, so a page whose options stay partly checked sets the property in its `change` handler — user chose docs over a `change:indeterminate` event, which a same-tick reset can't reach, 108425ce);
     c-icon-button disabled ink fixed (5eaa4c88).
   - **Side navigation: the page owns the current page (user decision 2026-10-27, 80f1a92b).** 75ab6d1d made a
     click mark the leaf `active` and clear the others; with a route binding, a cancelled navigation left the
     clicked item highlighted, and Vue never rewrote it (binding unchanged), even across later route changes. The
     navigation now leaves a leaf's `active` alone (`select`, drawer close and parent expansion unchanged), as
     the docs site and every canon already bind it. MyCSC check: every side-nav item and sub-item binds `active`
     from the route (3.x highlighted a clicked top-level item by itself).
   - **ARIA id references (user decision 2026-10-27: forward them, `_plan/aria-id-references.md`, ADR-0078).**
     A side agent noted that `aria-labelledby`/`-describedby`/`-controls` on a `c-*` element reached nothing
     (kept on the host since d6253feb). Fixed with ARIA element reflection: `useIdReferences` resolves the
     host's ids in the host's tree and hands the elements to the element carrying the role, merged after the
     component's own; 38 tags wired, the rest listed in `aria-object.ts` and asserted by all-components.
     Found on the way and fixed first (10836590): a host `aria-label` never named a field's input.
     MyCSC check: none needed for these attributes; they now work.
   - **Hints and error messages linked (user decision 2026-10-27, `_plan/field-message-link.md`).** A side agent
     asked to confirm that fields never link hint / error text to the control: confirmed (only c-otp-input did).
     The c-input fields now render FieldMessage in their own tree (c-input offers a `message` slot) and point
     the input's `aria-describedby` at it; c-checkbox, c-radio-group, c-file-upload link theirs. Fields gain a
     `message` part. Axe never flagged it.
     Follow-up (user decision): `host.focus()` did nothing on any value control, so an app could not move focus
     to an invalid field; the 15 form controls now expose `focus()` (minor changeset). MyCSC check: after a
     failed submit, focus the first invalid field (or an error summary).
   - **Merge conflict ahead:** the `development` → `main` PR conflicts in `packages/csc-ui/package.json`: phase 3's
     new `description` is the line after `version`, which `main`'s release commits bumped (development still has
     alpha.18). Resolve with `main`'s version and `development`'s description. A wrong pick is cosmetic, not a
     rollback (checked 2026-10-27 by resolving to alpha.18 in a throwaway merge): csc-ui-react merges cleanly at
     main's alpha.32, and the fixed group takes the highest version and pre number, so `changeset version` still
     gives alpha.33 to both and rewrites the stale line. (`changeset publish` would skip, not fail on, a version
     already on npm.) From here: fixes only, API guard fails any breaking diff.
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
  Chromium-only spec, Kebab-case twin retired). Done since (checked 2026-10-28): **Value events** says a Vue
  template cannot hear `update:value`; **Internal** covers tags, props, events, slots and methods (c-dropdown,
  c-input); validity is `invalid`; the `mobile` grandfathered list is corrected (names kept, D13); **Example
  smoke** has axe and the React/TypeScript flavors. Left for phase 5: CONTEXT.md's claim that
  `@cscfi/csc-ui-vue(2)` are deprecated on npm becomes true only then.
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
