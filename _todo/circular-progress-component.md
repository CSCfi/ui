# CProgressCircle (`c-progress-circle`)

> **Status: IMPLEMENTED 2026-08-31** — component, usage.md, registration,
> docs examples and changeset are in the working tree; visually verified in
> light + dark. Only the follow-ups at the bottom remain open.

The circular counterpart of `c-progress-bar`, for **determinate** progress only.
Spec resolved in a grilling session 2026-08-31; boundaries are recorded in
`CONTEXT.md` § Progress & loading.

## Boundaries (decided)

- **Determinate-only.** No `indeterminate` prop — circular unknown-duration
  waiting stays `c-spinner`'s job. The axis is known-value vs pure activity,
  not shape. `usage.md` must point readers at `c-spinner` for that case.
- **Not named `c-progress-circular`.** Noun-parallel with `c-progress-bar`
  (Vuetify's adjective naming rejected).

## Props

- `value` — progress percentage, 0–100. Clamped like `CProgressBar`'s
  `safeValue` (below 0 → 0, above 100 → 100). Default `0`.
- `size` — number, pixels. Default `32`.
- `width` — stroke thickness, number, pixels (same name/unit as `c-spinner`).
  Default `4`. A prop (not `::part()` styling) because the radius math depends
  on it, as in `CSpinner`.
- **No `rotate`** — dropped (YAGNI; a start-angle prop can be added later
  non-breaking).
- **No `color`** — primary arc on a surface-muted track, matching
  `c-progress-bar`; restyling via `::part()` (ADR-0006). (`c-spinner`'s color
  prop exists only for cross-shadow embedding by parent components.)
- **No `hide-details` / `label`** — nothing auto-renders in the center.

## Slots

- `default` — optional center content ('57%', an icon). Empty by default;
  nothing auto-renders. Value reaches AT via `aria-valuenow` regardless.

## CSS parts

- `root` — outer wrapper
- `track` — background ring
- `bar` — value arc (kept as "bar" for vocabulary parity with
  `c-progress-bar`'s part set)
- `content` — centered slot wrapper (same part name as `c-loader`'s message
  wrapper)

## Accessibility

- Inner element: `role="progressbar"` + `aria-valuemin/max/now`.
- **No host mirroring** — no `title`, no `aria-busy` writes. Consumers name it
  with `aria-label` on the host.

## Behavior

- Value changes animate (0.3s ease-in-out on the arc, parity with the bar's
  fill transition).

## Deliverables

- `packages/csc-ui/src/components/c-progress-circle/CProgressCircle.vue`
- `usage.md` colocated (ADR-0026) — first paragraph is the component
  description; include the c-spinner handoff guidance
- Register in `src/index.ts` (+ tag map regen), docs examples under
  `app/examples/c-progress-circle/` with flavor variants
- Changeset (minor, user-facing)

## Follow-ups surfaced during grilling (separate from this component)

- `CProgressBar.vue:143` writes `aria-busy` as `(!indeterminate)` — busy=true
  when *determinate*, which looks inverted. Fix separately; do not clone.
- `c-progress-bar` and `c-spinner` have no `usage.md` despite ADR-0026.
