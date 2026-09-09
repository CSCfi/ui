# Make the docs package's lint actually catch formatting

> After approval, copy this file to `_plan/docs-lint-formatting-gate.md` (repo convention for plan files).

## Context

`packages/csc-ui-documentation/app/examples/c-autocomplete/multiple.vue` has a mangled `@mdi/js` import (trailing space, five blank lines inside the specifier list) and nothing flags it. Diagnosis (all verified read-only, 2026-09-09):

- **ESLint does lint the script block** — right parser chain (`vue-eslint-parser` → `typescript-eslint/parser`), file not ignored, 189 rules active. But `eslint.config.mjs` appends `eslint-config-prettier` **last**, which switches off every whitespace/formatting rule (`no-multiple-empty-lines`, `no-trailing-spaces`, `indent`, …) and, as a side effect, **silently disables the repo's own `vue/html-self-closing: error`** (eslint-config-prettier lists it; the docs config already passes the prettier-compatible `html.void: 'any'` option, so the intent was clearly to keep it on). Formatting is therefore Prettier's job — but the docs package has no `eslint-plugin-prettier`, so ESLint never reports Prettier diffs. `packages/csc-ui` does it the other way round (`eslint-plugin-prettier/recommended` + `'prettier/prettier': 'error'`), which is why formatting shows up there and not here.
- **Prettier does catch it** (`prettier --check` → warn on this file) but never runs: `lint` is `lint:js && lint:prettier`, and `lint:js` already fails with 30 pre-existing errors in other files (28× `vue/padding-line-between-tags` in `app/pages/data-visualization.vue`, 2× `newline-before-return`), so the `&&` short-circuits. 10 other files on `HEAD` are also unformatted — the gate has been dead for a while.
- No CI job, pre-commit hook (`.husky/pre-commit` is a commented-out Lerna leftover) or editor setting runs either tool. The user opens the repo in VS Code attached to the devcontainer (vscode-eslint 3.0.34 + prettier-vscode installed); `.vscode/settings.json` has no fix-on-save.

Scope settled with Oskari (2026-09-09): **config + backlog cleanup only** (no CI job, no pre-commit hook), plus editor fix-on-save in `.vscode/settings.json`.

## Change

### 1. `packages/csc-ui-documentation/package.json`

- Add devDependency `"eslint-plugin-prettier": "^5.5.6"` (same specifier as `packages/csc-ui/package.json`). The workspace `overrides` pin it to `^5.0.0` and the lockfile already holds 5.5.5 for csc-ui, so this only links, no new download; `eslint-config-prettier` stays (it is the plugin's peer dependency and `recommended` consumes it).
- Scripts unchanged (`lint`, `lint:js`, `lint:prettier`, `lint:fix` are fine once the backlog is green; `eslint --fix` now formats too).
- Install with `CI=1 pnpm install --no-frozen-lockfile` from the root (CI=1 avoids the NO_TTY abort; `--no-frozen-lockfile` because `pnpm-lock.yaml` must gain the new importer entry). Commit the lockfile change.

### 2. `packages/csc-ui-documentation/eslint.config.mjs`

Mirror csc-ui's model so one `eslint .` reports Prettier diffs as errors and the repo's rules win over eslint-config-prettier:

```js
import withNuxt from './.nuxt/eslint.config.mjs';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import stylistic from '@stylistic/eslint-plugin';

export default withNuxt(
  { ignores: [ /* unchanged, minus the stray '--port/' entry */ ] },
  eslintPluginPrettierRecommended,   // eslint-config-prettier + prettier/prettier: error
  { plugins: { '@stylistic': stylistic }, rules: { /* unchanged */ } },
);
```

- `withNuxt(...customs)` is `composer.append(...customs)` (verified in `.nuxt/eslint.config.mjs`), so order = Nuxt configs → ignores → prettier recommended → repo rules. Putting the repo `rules` object **after** the prettier config is what un-clobbers `vue/html-self-closing`; drop the old trailing `prettierConfig` import/arg.
- Remove `'--port/'` from `ignores` (no such directory; stray from commit 84882b8b).
- Existing `.prettierrc` is picked up by `prettier/prettier` via Prettier's config resolution — no change.

### 3. Clear the backlog so `pnpm lint` is green

From `packages/csc-ui-documentation`: `pnpm run lint:fix` (= `prettier --write --list-different . && eslint . --fix`). Expected effect:

- Prettier rewrites 11 files: `app/components/ApiComponent.vue`, `app/pages/{data-visualization,migration}.vue`, `nuxt.config.ts`, `app/examples/c-autocomplete/multiple.vue` (the test file — its import gets collapsed back to one line), and 6 flavor variants (`c-card-title/basic.react.tsx`, `c-list-item/basic.react.tsx`, `c-list/basic.react.tsx`, `c-menu-item/active-items.{react.tsx,typescript.html,typescript.ts}`). Flavor files are display-only text but are in `lint:prettier`'s scope by design (not in `.prettierignore`), so format them.
- ESLint autofixes the 30 errors + the 1 `@stylistic/padding-line-between-statements` warning, and the 4 newly live `vue/html-self-closing` hits: `app/app.vue:8` (`<c-csc-logo>`), `app/components/ColorSwitcher.vue:7` (`<span>`) and `:32` (`<c-divider>`), `multiple.vue:20` (`<c-icon>`). Self-closing is fine in SFC templates (Vue's own parser) and matches csc-ui's rule.
- Remaining output: 4 `vue/no-v-html` warnings (deliberate markdown rendering) — warnings, not errors; leave them.

**Hazard to check by hand after the fix** — `htmlWhitespaceSensitivity: ignore` lets Prettier break an inline element and its trailing punctuation onto separate lines; Vue's `condense` whitespace mode renders that as a space before the punctuation. Pre-checked: exactly one such spot, `ApiComponent.vue` ~line 233–235 (`<code>{{ view.tagName }}:state(checked)::part(indicator)</code>.` → `</code>` / `.` on its own line ⇒ "…) ."). Fix it by rewording so the sentence doesn't end on the inline `<code>` (or, failing that, `<!-- prettier-ignore -->` on that `<p>`). Also skim the other rewritten prose (`migration.vue`, `data-visualization.vue`) for the same pattern: `git diff | grep -nE '^\+\s*[.,;:!?]\s*$'` must be empty.

### 4. `.vscode/settings.json` (root)

Add fix-on-save so the ESLint extension (which now carries Prettier) repairs formatting on Ctrl+S:

```json
"editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
```

- **Skip `eslint.workingDirectories`** despite the earlier suggestion: vscode-eslint 3.0.34's default `location` mode already walks up from the edited file to the nearest `eslint.config.*` and uses that directory as cwd (verified in the extension's server bundle; the ESLint output log shows the library loading fine). Adding it would be redundant config.
- Edit only by inserting the key next to `"js/ts.tsdk.path"`; the file also carries Oskari's uncommitted Peacock colour changes, which stay untouched. Side observation only (not changed): the two `customData` entries still point at the retired `@cscfi/csc-ui-next` package.

### 5. Changeset

`pnpm changeset --empty` at the root — required by `.github/workflows/changeset-check.yml` for any PR to main; this is tooling-only, so it must not release (`@cscfi/csc-ui-documentation` is in the changesets `ignore` list anyway).

### Not in scope (parked, per Oskari's choice)

CI lint workflow, lint-staged/husky pre-commit, unifying the two packages' ESLint configs, `@nuxt/eslint` `checker`, csc-ui's own missing `lint` script, the stale customData paths, and the `ignoreDepScripts` pnpm warning.

## Verification

1. Before touching the backlog, keep the mangled `multiple.vue` as the probe: after steps 1–2, `pnpm --filter @cscfi/csc-ui-documentation exec eslint app/examples/c-autocomplete/multiple.vue` must now report `prettier/prettier` errors on lines 30–37 and `vue/html-self-closing` on line 20 (today: exit 0, no output).
2. After step 3: `pnpm --filter @cscfi/csc-ui-documentation lint` exits 0 (both halves run; only the 4 `vue/no-v-html` warnings remain). `prettier --check .` reports no files.
3. `git diff --stat` matches the expected 11 formatted files + `app.vue`, `ColorSwitcher.vue`, `data-visualization.vue`; the punctuation grep in §3 is empty; re-read the `ApiComponent.vue` hunk.
4. `pnpm --filter @cscfi/csc-ui-documentation run lint:examples` (flavor parity script) still passes after formatting the flavor files.
5. `pnpm --filter @cscfi/csc-ui-documentation build` (csc-ui `dist/` is present) to confirm the reformatted `nuxt.config.ts` and pages still compile; optionally load `/components/c-autocomplete` in `pnpm dev` (port 3500) to eyeball the ApiComponent sentence.
6. Re-mangle the import once more, save in VS Code, confirm the squiggle appears and Ctrl+S fixes it (editor check, Oskari's side).
