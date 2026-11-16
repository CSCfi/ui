# c-status: a softer look, two appearances, a marker, a consumer icon and three sizes

## Context

`c-status` (packages/csc-ui/src/components/c-status/CStatus.vue) has a single look: the status
family's `*-subtle` fill, its `on-*-subtle` ink, and a 1px `ring-current` outline in that ink,
with the text centred in a box at least 88px wide. The user wants it softer and with more
variants, based on the reference temp/status-badge-design.jpg: **outlined vs filled** ×
**icon vs dot**. Adding props is non-breaking, and pixel appearance is not public API (CONTEXT.md
"Public API"), so this can land in the rc line. In pre mode it needs a minor changeset.

## Decisions (grilling log)

1. **API shape**: three props beside `type` (the colour), all independent:
   - `appearance`: `filled` (built-in) | `outlined`. Reuses the glossary's **Appearance** axis.
   - `marker`: `none` (built-in) | `icon` | `dot`. Not "indicator" or "mark", which the
     selection controls already use in CONTEXT.md.
   - `size`: `small` | `default` (built-in) | `large`.
2. **Icons** match c-alert and c-toast: success `mdiCheckCircle`, warning `mdiAlert`, error
   `mdiCloseCircle`, info `mdiInformation`. Hoist the three copies into one shared map.
3. **Neutral + `marker="icon"`** draws a grey halo with a dot inside, so a neutral pill in a
   column of icon pills keeps its leading mark, and its text starts where theirs does.
   `marker="dot"` on a neutral pill is the grey dot.
4. **Sizing**: the pill fits its content, with no 88px minimum and no centring, in medium-weight
   text (see the size table below). A consumer who wants equal widths sets `min-width` on
   `::part(root)`.
5. **Parts**: one new `marker` part on whichever shape renders: the halo `<span>` (holding the
   icon, the neutral dot or the slotted icon) or the dot `<span>`. The icon and dot draw in
   `currentColor`, so `color` on the part recolours them; the halo is its background. The marker is `aria-hidden`, because the text names the state.
6. **App defaults** (ADR-0048): `appearance`, `marker` and `size` are all `@defaultable`, so an app
   sets its house style once, and `marker="none"` lets a single pill opt out.
7. **Records**: write ADR-0087 and add CONTEXT.md entries (texts below).
8. **Consumer icon**: an `icon` slot, the name c-button, c-menu-item and c-accordion-item already
   use. When it has content, the slotted icon *is* the marker. It renders in the marker's place
   whatever `marker` resolves to (app-default dot, `icon` or `none`), so it never disappears
   without warning. It sits in the same `marker` part and box and inherits the marker colour
   (`c-icon` defaults to `currentColor`), centred in the halo. The pill sizes it (14px; 11 small,
   18 large) whatever its own `size`: c-icon reads a private `--_c-icon-size` hook before `size`
   (like its `--_c-icon-color`), set by the halo, and `::slotted(svg|img)` covers plain icons.
   Decided 2026-11-13 after a side-agent note showed an unsized icon spilling 6–10px over the
   text; a docs-only rule was the alternative. An inline style can't be
   overridden through `::slotted`. It is decorative like the built-in marker: the wrapper is
   `aria-hidden`, so the text must name the state.

### Colours and marker look: decided at the gate (2026-11-13)

Comparison page: https://claude.ai/artifact/SNkqT1qTskGB68C9FySRDB (v4; source in the session
scratchpad). The user picked:
- **Filled**: the opaque `*-subtle` token fill, text `on-<role>-subtle`, and an edge of the role
  mixed 40% into the fill (c-alert's border share). Labels stay at AA on every ground in both modes
  (lowest 4.74:1). c-alert's 10% tint was rejected: light Active read 4.43:1 on a selected
  c-data-table row. Neutral: `surface-muted` fill, `on-surface-muted` text, and an
  `on-surface-muted` 40% edge.
- **Outlined**: transparent ground, `on-surface` text, and an `on-surface-muted` 40% translucent
  edge. The `border` token was rejected: 1.00:1 on the dark popover, 1.07:1 on the light canvas.
- **Icon marker = haloed icon** (c-toast's badge at pill scale): a circle of the role at 20%,
  opaque through `bg-tint-*` (ADR-0082), around the status icon in `on-<role>-subtle`. The icon
  holds at least 3.12:1 against its halo everywhere. The role-fill icon (light warning 1.09–1.31:1)
  and a midway mix (2.19–2.97:1) were rejected. A neutral halo holds an `on-surface-muted` dot.
  A slotted icon sits in the same halo.
- **Dot marker**: the role fill (`<role>`, neutral `on-surface-muted`). It is decorative: the
  light warning dot reads 1.13–1.42:1 and the user accepted that so the hues stay distinct. ADR-0087
  records it as an exception to ADR-0080's 3:1 for icons.
- **Sizes** (`size` gains `large`):

  | size    | height | padding | gap | text | halo | icon | dot |
  | ------- | ------ | ------- | --- | ---- | ---- | ---- | --- |
  | small   | 20px   | 6px     | 4px | 12px | 14px | 11px | 6px |
  | default | 24px   | 8px     | 6px | 14px | 18px | 14px | 8px |
  | large   | 32px   | 12px    | 8px | 16px | 24px | 18px | 10px |

  A neutral halo's inner dot is about 36% of the halo: 5, 6 and 8px.

## Implementation

0. Copy this plan to `_plan/c-status-appearance-marker.md` (memory: plans live in `_plan/`).
1. Colour gate (above).
2. **Shared icons**: new `packages/csc-ui/src/shared/statusIcons.ts` exporting
   `STATUS_ICONS: Record<'error' | 'info' | 'success' | 'warning', string>`. Replace the local maps
   in `c-alert/CAlert.vue` (the `icons` const) and `c-toast/CToast.vue` (keep its `close` entry
   local). No pixel change; their specs and baselines must stay green.
3. **CStatus.vue**:
   - Export the component-owned types `CStatusAppearance`, `CStatusMarker` and `CStatusSize`,
     prefixed per the tag-map naming trap. Props are JSDoc'd with `@defaultable 'filled'`,
     `'none'` and `'default'`, declared `undefined` in `withDefaults`.
   - Resolve them with `useAppDefault('c-status', props)` (`src/shared/appDefaults.ts`; see
     `CButton.vue`'s `appDefault('variant', 'primary', …)`). Unknown strings fall back to the
     built-ins, like the existing `type in typeVariants` guard.
   - tv: slots `root` and `marker`; variants `appearance`, `type` (`''` = neutral), `size` and
     `shape` (icon | dot | iconDot for a neutral icon). `compoundVariants` cover
     appearance × type. Use only semantic utilities (`lint:tokens`, `lint:tint`).
   - Template: before `<slot />`, render one of:
     - `<span part="marker" aria-hidden v-show="hasIcon"><slot name="icon" /></span>`, where
       `hasIcon` comes from `useHasSlot(rootRef, 'icon')` (`src/shared/useHasSlot.ts`, as
       c-button uses it). The slot stays in the DOM, so `slotchange` can fire;
     - else `<svg part="marker" aria-hidden viewBox="0 0 24 24"><path :d/></svg>`;
     - else `<span part="marker" aria-hidden>` for the dot.
   - Docblock: `@csspart marker` and `@slot icon` (tags only, ADR-0026).
4. **Spec** (new `c-status/CStatus.spec.ts`, via `src/test/harness.ts`):
   - each type × marker renders the right glyph or dot; a neutral icon renders the dot;
   - the marker is `aria-hidden`, and `none` renders no marker;
   - unknown attribute values fall back to the built-ins;
   - app defaults apply, and `marker="none"` overrides an app-wide marker;
   - a slotted icon replaces the marker under `none`, `dot`, `icon` and an app-default dot;
     adding or removing it later toggles the built-in marker back (`slotchange`);
   - `matchScreenshotInBothModes` on one matrix: types × (filled/outlined × none/dot/icon), plus
     a small row and a slotted-icon row.
5. Add `'c-status'` to the pinned allow-list in `src/shared/appDefaults.spec.ts`.
6. **usage.md**: rewrite Sizing (fits content, the `min-width` recipe) and Customization (the
   `marker` part, colour roles). Add Appearance, Markers (including the `icon` slot and its
   `c-icon` size) and Size sections, plus the app-default example. The first paragraph stays the
   description.
7. **Docs canons** in `packages/csc-ui-documentation/app/examples/c-status/`: `appearances`,
   `markers`, `sizes` and `custom-icon`, each in `.vue`, `.react.tsx`, `.angular.ts` and `.typescript.html`
   (mirroring c-button's names). Keep `basic`.
8. **Build artefacts**: `pnpm ui build` updates the manifest, tag map, `CAppDefaults` and
   `api.snapshot.json`. `pnpm --filter @cscfi/csc-ui-react build` regenerates the committed
   `components.ts`.
9. **CONTEXT.md**:
   - **Status pill** (`c-status`): a short word naming a record's state, coloured by its `type`,
     in one **appearance**, optionally led by a **marker**; not interactive, and colour never
     carries the state alone. _Avoid_: badge (`c-badge`), tag (`c-tag`), chip, status badge.
   - **Marker** (`c-status`): the small symbol before a status pill's text: `icon` (the status's
     shared icon) or `dot`, `none` for text only, or a consumer icon in the `icon` slot, which
     overrides all three. Decorative. A neutral pill's icon marker is its dot. _Avoid_: indicator and mark (selection controls), icon (one of its shapes), required
     marker (the label's asterisk).
   - **Appearance** extends to `c-status`: `filled` (default) and `outlined`.
   - Flagged ambiguities: "marker" in usage prose ("required marker") vs the c-status marker.
10. **ADR-0087** `docs/adr/0087-c-status-picks-an-appearance-a-marker-and-a-size.md`: the axes and
    their rejected alternatives (booleans, one combined prop), the names, the neutral dot, fitting
    the content, the shared icons, defaultable with `none`, the slotted icon overriding `marker`,
    and the colour roles picked at the gate.
11. **Changeset** (`pnpm changeset`, minor): "c-status takes `appearance`, `marker` and `size`,
    all app-defaultable, an `icon` slot for a custom marker, and fits its content."
12. Commit as `Feat(c-status): …`. A separate commit is fine for the icon hoist (`Refactor`, no
    changeset per memory). Follow-up: MyCSC tables lose the 88px minimum, so check them during the
    rc upgrade.

## Verification

- `pnpm ui build`, then `pnpm ui type-check` (memory: CI's type-check catches spec types that
  `pnpm build` skips).
- `pnpm lint` (oxlint, ESLint, guards including `lint:tint` / `lint:tokens` / `lint:a11y`, and
  docs example parity), plus `pnpm format:check`.
- Run one spec file at a time (devcontainer OOM): `CStatus.spec.ts` (write its baselines with
  `--update` and review both PNGs), `CAlert.spec.ts`, `CToast.spec.ts`, `appDefaults.spec.ts`,
  and `src/test/conformance/all-components.spec.ts` (conformance and the typography / bare-theme-var trap).
- `pnpm --filter @cscfi/csc-ui-documentation test` (the example smoke) after the build. Look over the
  docs page in `pnpm dev`, light and dark.
- Firefox locally with `TEST_BROWSERS=firefox` for the spec. CI covers WebKit.
