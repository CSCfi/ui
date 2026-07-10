# csc-ui-next: split c-tab-buttons into c-button-group + tabs adapter

Decision record: ADR-0023 (amends ADR-0022). Glossary: CONTEXT.md entries
**Button group**, **Tab buttons**, **Active**, **Mandatory** (owner moved),
**Group label** (set updated).

## Decisions (settled 2026-07-10)

- New standalone component **`c-button-group`**: labelable value control
  (group label + `required` per ADR-0022), `value` + v-model, `multiple`
  (array value, property/v-model only), `mandatory` (selection can never
  become empty; with `multiple` the last active locks), `size`, `disabled`.
  Events are new-style all-lowercase (`update:value` + `change`) — no
  `changeValue`, no kebab twin (ADR-0017 grandfathering is for migrated
  tags only).
- Children are **plain `c-button`s** (Stencil authoring parity).
  **`c-button` gains a public `active` prop**: selected look +
  `aria-pressed`; the group flips it instead of piercing child shadows for
  styling.
- **`c-tab-button` is deleted** (net-new in the rewrite, never in Stencil).
- **`c-tab-buttons` becomes a composed child of `c-tabs`** — tabs-only
  adapter wrapping `c-button-group` in its shadow. Loses `tabs`, `label`,
  `required`, `mandatory`. Standalone use is a documented upgrade break →
  `c-button-group`.
- Active fill: **sliding indicator in single-select** (group suppresses the
  children's own active fill, keeps the text flip), **per-button self-fill
  in `multiple`**.
- Not form-associated (no ElementInternals) — if ever wanted, that is a
  separate library-wide ADR.

## Work items

### c-button

- [x] Add `active` prop: active look (fill) + `aria-pressed` on the native
      control; reflect to the `active` attribute so consumers can style
      `c-button[active]::part(root)`.
- [x] A mechanism for the group to suppress the self-fill in single-select
      mode (indicator paints instead) while keeping the text flip — keep it
      internal (e.g. inherited `--c-*` var or attribute contract owned by
      the group), not public API.

### c-button-group (new)

- [x] Component: wrapper + FormLabel (group label + `required`,
      `part="label"`, `role="group"`/`aria-labelledby`), root frame +
      sliding indicator (port from CTabButtons).
- [x] Child discovery via `slot.assignedElements()` (works both for direct
      consumer children and for slot-forwarded children inside the
      c-tab-buttons adapter; `:scope >` queries do not).
- [x] Selection logic: single (index- and value-based, deselect-to-empty,
      `mandatory`) + `multiple` (array value, last-active lock under
      `mandatory`).
- [x] Events: `update:value` + `change` + native `input` via
      emitModelValue; host `value` property mirror for plain v-model.
- [x] Roving tabindex + ArrowLeft/ArrowRight (port; focus/measure via the
      existing two-hop native-control reach, as the ResizeObserver already
      does).
- [x] Indicator geometry: port ResizeObserver + double-rAF measuring;
      indicator hidden entirely in `multiple` mode.

### c-tab-buttons (demote to adapter)

- [x] Rewrite as composed child of c-tabs: shadow-render
      `<c-button-group mandatory-ish tabs-bridge><slot /></c-button-group>`
      equivalent; bridge value pushes from c-tabs and selection events up,
      without c-button-group knowing about tabs.
- [x] Remove `tabs`, `label`, `required`, `mandatory` props; keep `size`,
      `disabled`, `value` passthrough as needed by c-tabs.
- [x] Mark `@subcomponents`/docs so it folds under c-tabs (no standalone
      page).

### c-tabs

- [x] Fix stale `tabsList()` query (`:scope > c-button` — correct again
      once children are plain c-buttons, but verify against the adapter's
      slot forwarding).
- [x] Verify aria wiring (`aria-selected`, `aria-controls`, role=tab) in
      buttons mode — it looked half-wired before the split.

### c-tab-button (delete)

- [x] Remove component, tag-name-map entry, React wrapper entry.
- [x] Remove `app/examples/c-tab-button/*` docs examples.

### Docs / manifest / wrappers

- [x] tag-name-map + React wrapper: add c-button-group, drop c-tab-button.
- [x] Move `c-tab-buttons` label examples (`label.*`, just added) to
      `c-button-group`; rewrite `basic.*`/`sizes.*` for c-button-group;
      c-tab-buttons examples live under c-tabs.
- [x] New examples: `multiple`, `mandatory`.
- [x] Migration guide: standalone `c-tab-buttons` → `c-button-group`
      (tag rename, `changeValue` → `change`/`update:value`, mandatory
      preserved); `c-tab-button` (next-only) removed.
- [x] Usage docs (`usage.md`) for c-button-group; trim c-tab-buttons' to
      the adapter story.

### Verification

- [x] Visual check light/dark (headless chromium recipe): single pill
      slide, multiple self-fill, disabled, sizes, label/required.
- [x] Keyboard: roving tabindex, arrows, toggle-off, mandatory lock,
      multiple last-active lock.
- [x] Tabs integration: `<c-tabs><c-tab-buttons><c-button>` markup parity
      with Stencil, value push-down, no deselection.

## Outcome notes (implemented 2026-07-10)

- Events go through a new `emitModelChange` helper (sibling of
  `emitModelValue` in `shared/emitModelValue.ts`) so the analyzer's
  event-map lint covers the new-style `change`/`update:value`/`input`
  triple; the group declares no `changeValue`.
- The single-select fill suppression is three inline
  `--_c-button-active-*` vars the group writes on each child; c-button's
  `active` compound variant reads them with semantic-token fallbacks.
- `c-button.active` defaults to `undefined` explicitly in `withDefaults` —
  without the entry Vue's Boolean casting turns "absent" into `false` and
  every action button would get `aria-pressed="false"`.
- c-tabs stands down from keydown/keyup entirely in buttons mode (the
  group owns Space/Enter via native click and arrow roving); its stale
  `:scope > c-button` query is now correct again for aria-controls wiring.
  Deeper role=tab/aria-selected wiring in buttons mode is unchanged
  (pre-existing gap, not widened by this change).
- ExampleBlock.vue (docs' own flavor switcher) migrated to
  c-button-group + c-button — the first real standalone-consumer
  migration.
- Verified with playwright-core (28 assertions incl. mandatory+multiple
  last-active lock) + light/dark screenshots; full build, strict manifest,
  token/a11y lints, react wrapper typecheck, docs typecheck/lint/parity
  all green.
- Post-review fix: the root is now a real `grid grid-flow-col auto-cols-fr`
  (the inherited `flex auto-cols-fr` only *claimed* grid in its comment).
  In shrink-to-fit contexts (docs `.example-row`) flex + `w-full` squeezed
  buttons below the longest label's max-content and the nowrap content
  overflowed the fill's right edge — visibly unbalanced x-padding on
  active buttons in `multiple` mode. fr tracks size to the longest label,
  so columns stay equal with symmetric padding.
