# Move from ESLint + Prettier to oxlint + oxfmt (ESLint kept for Vue template rules)

Grilled 2026-10-06. ADR-0068 records the decision; glossary: **Guard**, and the flagged ambiguity "Lint".

## Context (measured 2026-10-06, oxlint 1.87.0 / oxfmt 0.72.0 trial in a scratch worktree)
- Nothing runs csc-ui's `eslint.config.ts`. Its `lint` script runs only the guards, CI lints only docs, and `.husky/pre-commit` is a no-op.
  Against tracked source it reports about 207 findings (prettier 105, padding-line 45, perfectionist ~33). The 8k raw count is
  gitignored `dist-types/`, which its ignore list misses.
- oxfmt using the migrated Prettier options matches Prettier almost exactly. In csc-ui: 1 `.vue` hunk (arrow hugging in CAlert.vue),
  a few specs and configs, and 4 one-line `usage.md` changes.
- oxlint runs perfectionist and `@stylistic` as `jsPlugins`, `.vue` script blocks included, in about 2 s. Its counts match ESLint's.
- Docs under the shared strict rules: 1,867 findings (sort-objects 1,436). The example variants add about 1,480. Nearly all can be
  autofixed. No flagged object is iterated by key order (checked `Object.*`, `for…in`, `v-for` over objects).
- Tailwind sorting: about 88 files and 500 lines in csc-ui, the same whether or not tokens were built. The `@theme inline` map is
  in `src/tailwind.css`.
- `minimumReleaseAge: 4320` (3 days): the newest installable pins are **oxlint 1.86.0 / oxfmt 0.71.0** until 2026-10-08. After that,
  1.87.0 / 0.72.0.

## Decisions
- **D1 Scope:** lint + format only. vue-tsc and the `type-check` step are unchanged; no tsgolint / `--type-aware`.
- **D2 Enforcement:** editor + CI + pre-commit, both packages. csc-ui gets a lint gate for the first time.
- **D3 Layout:** one root `.oxfmtrc.json`, `.oxlintrc.json` and `eslint.config.ts`, with per-package `overrides`. Drop `@nuxt/eslint`
  (module + dep). `vue/block-order` follows csc-ui (`template, script:not([setup]), script[setup], style`); docs has no file with
  both script blocks.
- **D4 ESLint scope:** only `.vue` files, only the `vue/*` rules oxlint lacks. The oxlint/ESLint split is by rule namespace.
  Perfectionist and `@stylistic/padding-line-between-statements` run as oxlint `jsPlugins`. Exact version pins.
- **D5 Docs strictness:** identical rules everywhere, perfectionist included, fixed in one autofix pass.
- **D6 Rule baseline:** parity with today's csc-ui config (eslint:recommended + typescript-eslint recommended equivalents, the
  oxlint `correctness` default, script-side `vue` rules, perfectionist recommended-alphabetical, the custom rules).
  **Implementation:** the vitest plugin was dropped. Its ~105 findings were mostly false positives (two-argument `expect`,
  helper assertions, parametrised conformance suites), and it was never part of the ESLint config. `@oxlint/migrate` generates the first draft from csc-ui's flat config;
  review it by hand. `suspicious`/`pedantic` stay off (a later decision).
- **D7 No warn tier:** padding-line and require-default-prop become `error`. Gate flags: `oxlint --deny-warnings`,
  `eslint --max-warnings 0`.
- **D8 oxfmt scope:** everything under `packages/**` plus root config files (tsconfig, vitest configs, `.oxfmtrc.json`
  itself). Ignored: `docs/`, `CONTEXT.md`, `CLAUDE.md`, `_plan/`, `_todo/`, `.changeset/`, `.claude/`, `.agents/`, `**/CHANGELOG.md`,
  `pnpm-lock.yaml`, and generated files: `dist-types/`, `.nuxt/`, `.output/`, `**/api.snapshot.json`,
  `packages/csc-ui/src/tag-name-map.ts`, `packages/csc-ui/src/theme/chart-data.ts`, the React wrapper's generated sources
  (confirm which `packages/csc-ui-react/src/*` the generator writes). The same generated set goes in oxlint's `ignorePatterns`.
- **D9 oxfmt options:** the former Prettier options, `sortPackageJson: false`, no `sortImports` (perfectionist owns imports), and
  `sortTailwindcss` per package: csc-ui `stylesheet: ./packages/csc-ui/src/tailwind.css` with `functions: ["tv"]`; docs
  `stylesheet: ./packages/csc-ui-documentation/app/assets/tailwind-sort.css`. **Implementation:** the docs `tailwind.css`
  imports `@cscfi/csc-ui/css/tailwind-theme.css` from csc-ui's `dist/`, and oxfmt *errors* (exit 2) when that import
  is missing. `tailwind-sort.css` imports the same theme from csc-ui's source instead. Checked: all 162 docs `.vue`
  files sort identically.
- **D10 Example variants:** `*.react.tsx`, `*.angular.ts` and `*.typescript.ts` lose their lint ignore and get the same rules,
  so canon and variants sort alike (`sort-jsx-props` mirrors `vue/attributes-order`).
- **D11 Editors:** VS Code and Zed. VS Code: `.vscode/settings.json` (oxc as default formatter for js/ts/vue/json/css/md,
  format-on-save, `source.fixAll.oxc`, ESLint validate limited to `vue`), `.vscode/extensions.json` (oxc.oxc-vscode,
  dbaeumer.vscode-eslint, Vue.volar; drop esbenp.prettier-vscode and the deprecated vue.vscode-typescript-vue-plugin),
  `.devcontainer/devcontainer.json` extensions (swap Prettier for oxc). Zed: `.zed/settings.json` (oxc extension LSP for
  lint + format, ESLint for vue only, Prettier off). Verify that the oxc language server runs the workspace oxlint from
  `node_modules`, which `jsPlugins` needs, and that jsPlugin fixes apply on save. If they don't, document `pnpm fix`.
- **D12 Hook:** check-only on staged paths (`git diff --cached --name-only --diff-filter=ACMR`): `oxfmt --check`, `oxlint`,
  `eslint` on the `.vue` files. Never write files, stash or restage. A failure prints `pnpm fix`. No type-check. Keep husky 8
  (`prepare-husky.sh`); no lint-staged.
- **D13 Scripts:** root `format`, `format:check`, `lint` (oxlint + ESLint + `pnpm -r lint:guards` + docs example parity),
  `fix` (format + `oxlint --fix` + `eslint --fix`). csc-ui `lint` → `lint:guards` (`lint:tokens` etc. keep their names). Docs
  `lint`, `lint:js`, `lint:prettier` and `lint:fix` go; `lint:examples` stays and is still chained into `build`/`generate`.
- **D14 CI:** fail fast. Before the build, add `format:check` and oxlint + ESLint steps. After the build, the guards as today,
  under their new names. The "Lint docs" step goes.
- **D15 Dependencies:** root devDependencies, exact: `oxlint` 1.86.0, `oxfmt` 0.71.0, `eslint-plugin-oxlint` 1.86.0,
  `eslint`, `eslint-plugin-vue`, `typescript-eslint` (parser only), `eslint-plugin-perfectionist`,
  `@stylistic/eslint-plugin`, `jiti` (TS config), `eslint-config-prettier`. The last one is only a list of rules to
  switch off; without it, strongly-recommended's template formatting rules fight oxfmt. Remove from both packages: `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`,
  `@eslint/js`, `eslint-import-resolver-typescript`, `@nuxt/eslint`, and the per-package eslint deps. Delete
  `prettier.config.ts`, `.prettierrc`, `.prettierignore`, both package eslint configs. Drop the root `pnpm-workspace.yaml`
  overrides for `eslint-plugin-prettier` / `eslint-config-prettier` / `eslint-import-resolver-typescript` if nothing else
  needs them.
- **D16 Suppressions:** the existing `eslint-disable` comments stay; oxlint honours them. ESLint gets
  `linterOptions.reportUnusedDisableDirectives: 'off'`, so it never strips a directive for a rule oxlint now owns (MyCSC lost 24).
  New suppressions of oxlint rules use `oxlint-disable-next-line <plugin/rule>`.

## Commits (one PR from `development`, empty changeset — internal tooling)
1. `Chore(tooling): Format with oxfmt and lint with oxlint, keeping ESLint for Vue templates`: configs, deps, scripts, hook,
   editors, CI, CLAUDE.md Commands, docs `nuxt.config.ts` module removal. No source changes, so CI on this commit alone is red;
   that's acceptable inside the PR.
2. `Style: Format with oxfmt and sort Tailwind classes`: `pnpm format`, mechanical. Add its hash to `.git-blame-ignore-revs`.
3. `Style: Apply lint autofixes`: `oxlint --fix` (perfectionist, padding) + `eslint --fix` (templates). Mechanical. Add it to
   `.git-blame-ignore-revs`.
4. `Fix(...)`: the remaining manual fixes (no-unused-vars, vue/no-mutating-props ×5, no-require-imports in `.cjs`,
   no-explicit-any etc.), each reviewed, if anything is left.
5. `.git-blame-ignore-revs` in its own commit (it needs the final hashes of 2–3).

## Verification
- `pnpm lint`, `pnpm format:check` green. Time oxlint, ESLint and oxfmt for the ADR numbers.
- Hazard greps on the autofix diffs (memory: oxlint autofix hazards): `| undefined = undefined`, `(undefined)` → `()`,
  `parseInt`/`parseFloat` rewrites. None of those rules is in the parity set, but check anyway.
- Whitespace hazard: on the format commit, `git diff | grep -nE '^\+\s*[.,;:!?]\s*$'` must be empty. Run the condense
  render-equivalence check (memory: Prettier whitespace hazard) over the changed `.vue` templates.
- Tailwind sort: the full browser suite with visual baselines in the devcontainer (a tailwind-merge order change shows as a
  pixel diff). Never update baselines to make this pass.
- `pnpm build`, csc-ui `type-check`, `pnpm test`, docs example smoke + `test:viewport`, and the strict manifest + API snapshot
  (prop and event declaration order must not change the manifest unexpectedly; perfectionist on `sort-interfaces` can reorder
  props in an interface, so check the analyzer output order).
- Hook: stage a misformatted file, and a file with a perfectionist violation; the commit is refused with the `pnpm fix` hint;
  nothing in the index or the working tree changes.
- Editors: in VS Code (devcontainer), save a `.vue` file and a `.ts` file. It formats, sorts Tailwind classes, applies
  perfectionist fixes, and ESLint reports a template rule. Check Zed the same way on the host.

## Open / later
- Widen oxlint (`suspicious` ≈125 csc-ui+docs, `perf`, vitest style rules): separate change.
- Port guards to oxlint `jsPlugins` rules: not planned; guards stay node scripts.
