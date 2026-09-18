# Fix red CI: stale docs example-smoke baselines after the 52px control height

> On approval, step 0 is to copy this file to `_plan/control-height-docs-baselines.md`
> (repo convention — plan mode only permits editing the harness path).

## Context

CI is red on `development` (run
[35311577858](https://github.com/CSCfi/ui/actions/runs/35311577858), head
`d660ee2f`). The failing step is **"Test (csc-ui browser + node projects)"**.

`0116d82b` *Feat(core): Standardize default control height to 52px* (ADR-0055)
moved row-level controls from 44px to 52px. That invalidated visual baselines in
**both** browser projects:

| Vitest project | Config | Baselines |
| --- | --- | --- |
| `browser` | `packages/csc-ui/vitest.config.ts` | `src/components/<c-tag>/__screenshots__/…` |
| `examples` | `packages/csc-ui-documentation/vitest.config.ts` | `tests/__screenshots__/examples.spec.ts/…` |

The follow-up commit `d660ee2f` *"updated screenshots"* refreshed 15 PNGs — all
of them in the `browser` project. The root script is:

```jsonc
"test:update": "… style-dictionary:build && vitest run --project browser --update"
```

`--project browser` silently skips `examples`, so the docs baselines were never
rewritten. The check-run annotations for `0116d82b` show both sets failing; for
`d660ee2f` only the `examples` six remain — which confirms the diagnosis rather
than a component fault.

**Six canons are stale** (light fails first, so dark is untested but equally
stale — 12 PNGs). Local baseline dimensions match CI's *expected* values exactly,
and the deltas are precisely the intended +8px:

| Canon | Baseline | CI actual |
| --- | --- | --- |
| `c-badge/basic` | 1248×44 | 1248×52 |
| `c-button/variants` | 1248×44 | 1248×52 |
| `c-select/basic` | 1248×102 | 1248×110 |
| `c-text-field/basic` | 1248×102 | 1248×110 |
| `c-tree-select/basic` | 1248×102 | 1248×110 |
| `c-card/basic` | 1248×230 | 1248×238 |

**Intended outcome:** CI green on `development`, and the root `test:update`
covering every browser project so this two-commit red pipeline cannot recur.

This is a baseline refresh, not a behaviour change — **no new changeset**
(`.changeset/control-height-52.md` already covers the user-facing change, and
`Changeset check` is already green on this head).

## Changes

### 1. Rebuild `@cscfi/csc-ui` first — mandatory

`packages/csc-ui-documentation/tests/setup.ts` imports
`@cscfi/csc-ui/css/tokens.css` and calls `defineCustomElements()` from the
**built** package. `packages/csc-ui/dist/csc-ui.js` is dated 2026-09-17 while
`src/components/c-input/CInput.vue` and `src/tailwind.css` are 2026-09-18 — the
dist is stale and still encodes 44px. Regenerating baselines against it would
bake in the old height and leave CI red.

```bash
pnpm --filter @cscfi/csc-ui run build
```

Watch for the known Tailwind scan miss (`project_csc_ui_new_sfc_tailwind_scan`):
confirm the new `--spacing-control` value actually lands in the emitted CSS
before trusting the run.

### 2. Regenerate the docs baselines

```bash
pnpm --filter @cscfi/csc-ui-documentation run test:update   # vitest run --update
```

Expected: 12 PNGs rewritten under
`packages/csc-ui-documentation/tests/__screenshots__/examples.spec.ts/`
(light + dark for the six canons above). **Review every diff** — the only change
should be the taller control box and the reflow it causes. Anything else (colour
shift, glyph change, layout break) means the 52px change has a real visual
regression in a canon and should be fixed in the component, not absorbed into a
baseline. Do not touch `allowedMismatchedPixelRatio` or `threshold` in
`vitest.browser.shared.ts`.

If files outside those six canons change, stop and investigate — the other eight
screenshot canons passed in CI and must stay byte-stable.

### 3. Close the `test:update` gap

`package.json` (root):

```jsonc
"test:update": "pnpm --filter @cscfi/csc-ui run style-dictionary:build && vitest run --project browser --project examples --update"
```

Naming both projects explicitly (rather than dropping `--project` entirely)
keeps the `node` project out of `--update`, so no node-side snapshot can be
rewritten as a side effect. This makes CLAUDE.md's documented
`pnpm test:update  # rewrite visual baselines` true for the whole monorepo.

Note the ordering dependency worth keeping in mind: the root `test:update` still
does **not** build `csc-ui`, so the `examples` project runs against whatever dist
exists. Step 1 stays a manual prerequisite.

## Critical files

- `packages/csc-ui-documentation/tests/__screenshots__/examples.spec.ts/` — the 12 PNGs (tracked, not gitignored)
- `package.json` (root) — `test:update` script
- `packages/csc-ui-documentation/tests/examples.spec.ts:100-110` — the `SCREENSHOT` set and the light/dark loop (read-only; no change)
- `vitest.browser.shared.ts` — shared comparator/tolerance (read-only; **do not** loosen)

## Verification

1. **Reproduce first** (before regenerating), to prove the six are the only failures:
   ```bash
   pnpm --filter @cscfi/csc-ui-documentation run test
   ```
2. Rebuild + regenerate (steps 1–2), then run the **full** suite exactly as CI does:
   ```bash
   pnpm test          # root: style-dictionary:build && vitest run (browser + node + examples)
   ```
   Expect green across all three projects.
3. **Inspect the PNG diffs** — `git diff --stat` should list exactly 12 files, all
   under the docs `__screenshots__` dir. Open the before/after pairs
   (`git show HEAD:<path>` into a temp file per `reference_git_stash_unusable_in_sandbox`)
   and confirm only the control height moved.
4. **Run the step CI never reached.** "Docs viewport smoke (360px phone)" was
   `skipped` because the test step failed, so it is untested against 52px
   controls — taller controls on a 360px viewport is a plausible new failure:
   ```bash
   pnpm --filter @cscfi/csc-ui-documentation run generate
   pnpm --filter @cscfi/csc-ui-documentation run test:viewport
   ```
   If this fails, it is a **real** regression from ADR-0055 and needs a component
   fix plus a behaviour spec, not a baseline edit.
5. Verify the widened `test:update` actually targets both projects (dry check:
   confirm vitest reports `browser` and `examples` in the run header).
6. Commit and push; confirm the CI run on the new head is green via the
   check-runs annotations API (`reference_csc_ui_ci_log_access`) — `gh` is not
   available and run logs need admin.

Commit message (repo style, no release semantics):

```
Fix(docs): Refresh example-smoke baselines for the 52px control height
```

## Watch items (not blocking)

- `CModal.spec.ts > initial focus > opened at mount…` failed on the `0116d82b`
  run but passed on `d660ee2f` with no related code change — likely the known
  monotonic-clock/attach-time flake (`project_csc_ui_test_harness`). If it
  reappears in the verification run, treat it separately.
- The `arm64 → x64` question is already settled: this devcontainer is `aarch64`,
  CI is `ubuntu-latest` x64, and the 15 baselines in `d660ee2f` were authored the
  same way and passed. The existing tolerance absorbs the anti-aliasing delta.
