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
- c-side-navigation-item `itemChange` → `select` (detail = originating event), like c-menu.
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
c-select, c-text-field, c-time-picker, c-tree-select). c-loader `visible` → `hidden` (drop `show()`/`hide()`).
c-side-navigation-item `focusable` → internal wiring. `docs:manifest:strict` fails any boolean with a `true`
built-in default. Migration-guide entry: `:valid="x"` → `:invalid="!x"`.

### D12 — All break-now audit findings land before rc.1
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

### D13 — Consider tier: the additive-path rule
**Before rc.1** (removals of unused/undeclared things, renames of alpha-era names, part / texts-key / type renames,
type narrowing, built-in default changes, behaviour bugs, and the low-use 3.x names named in the rule):
- Tokens: remove `--c-ring`/`ring` (unused), Stencil-era `--c-text-*` / `--c-transparent` (grep MyCSC first).
  c-icon: drop the undeclared `--c-icon-color` hook (ADR-0006; recolour via `::part`).
- c-modal keeps `dismissable` — the glossary's **Dismissable** (light-dismiss gestures) is a different concept from
  a close button (`closeable`, D12's c-alert rename); only the stray "dismissible" in the file-upload entry changes.
- `mobile` / `mobile-breakpoint` on c-side-navigation / c-tabs renamed to state names; correct the glossary's
  grandfathered list (c-steps has none; side-nav `mobile` is consumer-set, not container-measured).
- c-accordion-item `collapsable`/`outlined`/`expanded` and c-list-item-title `active` → internal wiring.
- c-data-table (alpha-era): `change:selected` detail = the `selected` value with a named type; `filter` (string)
  renamed so it no longer clashes with the predicate `filter` of c-autocomplete/c-tree-select.
- c-tooltip `content` slot → default slot (like c-popover). c-menu-item `icon` path prop → `icon` slot; `active`
  becomes two-state + an explicit checkable/type switch.
- Part renames: c-login-button `title`, c-menu-item `submenu`, c-side-navigation-title `label` (holds a heading),
  c-time-picker `end-tab`, list-row `item` vs `option` unified across select/autocomplete/tree-select/pickers.
- Texts keys: c-tree-select `select` → `selectBranch`, `step`; c-number-field `increase`/`decrease` vs parts;
  c-file-upload `waiting` → `queued` and `dismiss` → `close` (**Closeable**).
- Types: `CPlacement` renamed per the shared-type rule; package-level `Family`/`ThemeMode`/`AppDefaults`… get the
  `C` prefix and the entry snapshot starts guarding exported type names; export the accordion value type.
- Narrowing / defaults: `number | string` → `number` on c-menu/c-popover/c-tooltip/c-steps numeric props; c-menu
  `select` detail typed; c-slider `unit` built-in default `'%'` → `''`.
- Bugs: c-option `selected` seeding (c-select emits value events on seed — must not); c-pagination leaks its inner
  menu's `select`; c-progress-bar `label` becomes the accessible name.

**4.x: add + deprecate, remove in 5.0** (3.x-era names in wide use): c-button/c-icon-button `outlined`/`ghost`/
`text` → `variant`; c-checkbox/c-switch `checked` → `value`; `hide-details` → `hide-message` (+ c-pagination
`hide-range`/`simple`); `host-id`/`element-id`/`input-id` unified; c-pagination `currentPage`/`itemsPerPage` →
`page`/`pageSize`; `width` → stroke naming on spinner/loader/progress-circle; `ripple`/`no-ripple` polarity;
c-card `fullscreen`; c-status vs c-alert neutral look; c-toasts `vertical`/`horizontal`/`absolute` → placement;
`automatic-capitalize` → `autocapitalize`; c-otp-input `has-autofocus`/`element-id`; c-slider `labels`;
c-side-navigation-item `active` (current vs expanded).
Needs a deprecation mechanism before the first 4.x deprecation: `@deprecated` → manifest `deprecated` → IDE data +
React JSDoc (+ a dev-mode warning that specs consume via `consoleSpy.expect`).

**4.x additive only:** `texts` for the fixed English strings (side-nav, sub-nav, toast, tabs, tab-buttons, steps,
nav button, alert, card); c-sub-navigation-item `select` (cheap to do with D4); text-family `label`/`message`/
`root`/`input` parts; c-text-field `min`/`max` accepting date strings; c-otp-input `disabled` + `texts`;
side-nav `autoheight` class → prop; `C*Props` exports; `addToast` returns the id; c-tabs arrow parts; c-popover
`heading` slot.

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

## Work, in order

Every PR to `main` carries its own changeset (major for breaking items while in pre mode → next alpha); MyCSC can
start migrating on the first alpha that carries D2–D4.

0. **Infrastructure first** (so later work is checked as it lands)
   - Analyzer: `@internal` for tags, props, events, slots, methods (`packages/csc-ui/scripts/analyzer/`; reuse the
     `_`-prefix handling at `script-api.mjs:284`); one generated internal-tag list consumed by docs, the example-parity
     script and `packages/csc-ui-react/scripts/generate.mjs`. Strict rule: no boolean with a `true` built-in default.
   - Lint: `@update:*` on a `c-*` element in a Vue template is an error (D3) — an ESLint `vue/*` rule (ADR-0068 keeps
     template rules in ESLint) plus the example-parity script for usage.md snippets.
   - API-snapshot breaking-change guard (D10), armed by pre tag: `alpha` → needs a major changeset, `rc` → fail.
   - CI: Firefox + WebKit instances in the browser project (`packages/csc-ui/vitest.browser.config.ts`,
     `.github/workflows/ci.yml` installs them), `chromiumOnly(reason)` helper + guard; fix what they surface.
   - Example smoke: axe (D14), React + TypeScript flavors (D15).
1. **Events** — D2–D4: delete twin dispatch (shared emit helpers / `useHostEmit`), add/align `change`, internal
   wiring events, side-nav `select`; regenerate the React wrapper; update docs canons (all four flavors) and the
   docs site's own `@item-change` bindings (`app/app.vue`).
2. **API fixes** — D11, D12, D13 "before rc.1", in themed PRs (internal surface → bugs → renames → tokens/types).
   Each rename also updates canons in all four flavors, usage.md and the migration guide.
3. **Docs** — D16 (migration guide can grow with each PR in 1–2; the rest here).
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
- **ADR-0076** No boolean prop defaults to true — D11 (`invalid`, `hidden`).
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
- The `@update:*` lint fails a fixture `<c-text-field @update:value="…">` in a Vue template; a Vue canon using
  `@input="fn($event.target.value)"` receives every keystroke's value in the example smoke.
- `docs:manifest:strict` fails a fixture prop `boolean = true`; manifest + React wrapper contain no camelCase event,
  no internal tag/prop/event/slot (`grep -E '"[a-z]+[A-Z]' api.snapshot.json` over events is empty).
- Example smokes: Vue, React and TypeScript flavors mount cleanly; axe reports zero violations in both modes.
- MyCSC on the latest RC: migration sweep items closed, e2e green (D8 gate).
- After publishing: `npm view @cscfi/csc-ui dist-tags` → `latest: 4.0.0`, `v3: 3.0.19`, no `alpha`/`rc` (same for
  `-react`); `npm view @cscfi/csc-ui-vue deprecated` non-empty; the 4.0.0 CHANGELOG entry is the curated one;
  a vanilla HTML page loading `dist/csc-ui.js` from the published tarball upgrades every tag.
