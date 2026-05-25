# Migrate from Lerna to pnpm workspaces

Lerna 7 was only running `lerna run build` and an unused `lerna publish` (publishing happens directly in `release-please.yml`); the project had drifted into a half-state with both `package-lock.json` and a stale `pnpm-lock.yaml`. We replaced Lerna with pnpm workspaces end-to-end (root scripts, package scripts, and CI) for a single dependency tool, fewer moving parts, and proper workspace symlinking across `csc-ui`, `csc-ui-react`, and the docs/example apps.

## Decisions worth recording

A future reader will see these specific knobs and wonder why — they were chosen deliberately:

- **pnpm version pinned via `packageManager`** (`pnpm@11.3.0` in root `package.json`) and `corepack enable` in CI. Single source of truth, no separate `pnpm/action-setup` step.
- **Inter-package deps kept as `"*"`, not `workspace:*`.** pnpm still links locally on `*`. Smaller diff, no rewriting at publish time, and the React wrapper's version is already synced explicitly by the release workflow.
- **`enable-pre-post-scripts=true`** in root `.npmrc`. pnpm 10+ disables `pre*`/`post*` hooks by default; `csc-ui` relies on `postbuild` running `move-styles`. Re-enabling preserves existing semantics with zero script edits.
- **Default strict module resolution** (no `shamefully-hoist`, no `node-linker=hoisted`). If a build surfaces a missing peer dep, fix the dep declaration — don't paper over it by hoisting.
- **`allowBuilds`**: `esbuild`, `@parcel/watcher`, `vue-demi`, `unrs-resolver` approved; **`nx` denied** (transitive only, not used by this repo).
- **Per-package `npm run X` rewritten to `pnpm run X`** (verbose form, not the `pnpm X` shorthand) so scripts grep cleanly and don't collide with pnpm built-ins if a future script is named `install`/`add`/etc.

## Consequences

- CI now requires a committed root `pnpm-lock.yaml` and runs with `--frozen-lockfile`. Release-please version bumps that change `package.json` without re-running `pnpm install` will break CI until the lockfile is regenerated.
- Per-package `package-lock.json` files (root, `csc-ui`, `csc-ui-documentation`) deleted; do not re-add.
- `pnpm publish` is called with `--no-git-checks` in CI because the release-please bump commit makes the working tree look dirty to pnpm's pre-publish guard.
