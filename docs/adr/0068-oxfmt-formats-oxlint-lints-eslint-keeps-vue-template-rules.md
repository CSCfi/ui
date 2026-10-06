# 68. oxfmt formats, oxlint lints, ESLint keeps only the Vue template rules

Date: 2026-10-06

## Status

Accepted

## Context

The repo formatted with Prettier and linted with ESLint, configured twice:
csc-ui's own flat config (typescript-eslint, `vue/*` strongly-recommended,
perfectionist alphabetical, `@stylistic` blank lines) and the docs site's
`@nuxt/eslint` preset with a smaller rule set. Nothing ran csc-ui's config:
its `lint` script ran only the **guards**, CI linted only the docs package,
and the pre-commit hook was a no-op. The packages had drifted apart on
`vue/block-order`, perfectionist and attribute order.

We want the OXC toolchain (oxlint, oxfmt) for speed in the editor and the
gate. oxlint lints the `<script>` blocks of `.vue` files but not their
templates, and it implements neither perfectionist nor
`padding-line-between-statements`. Its `jsPlugins` can load ESLint plugins
that need no custom parser, perfectionist and `@stylistic` among them, but
it is alpha and outside semver.

## Decision

- **One root config per tool**: `.oxfmtrc.json`, `.oxlintrc.json` and
  `eslint.config.ts`, with per-package `overrides`. Both packages share one
  rule set. Perfectionist covers the docs site, its canon examples and their
  hand-written **example variants**, so every flavor tab lists keys and
  props in the same order. `@nuxt/eslint` is dropped.
- **oxlint owns every script.** It covers rule parity with the former
  ESLint config (oxlint `correctness`, eslint:recommended and
  typescript-eslint recommended equivalents, the script-side `vue` rules),
  with perfectionist and `@stylistic` loaded as `jsPlugins`. Because
  `jsPlugins` is alpha, oxlint and oxfmt are pinned to exact versions.
- **ESLint owns only `vue/*`**: it runs on `.vue` files with the
  eslint-plugin-vue rules oxlint does not implement (template rules such as
  `attributes-order`, `html-self-closing`, `padding-line-between-tags`), and
  no core or TypeScript rules; `eslint-plugin-oxlint` switches off the
  `vue/*` rules oxlint also runs, and `eslint-config-prettier` (a list of
  rules to switch off, which oxfmt needs just as Prettier did) the template
  formatting rules. The typescript-eslint parser stays only to parse.
- **oxfmt owns formatting under `packages/`**: code, JSON, CSS and package
  Markdown, using the former Prettier options, with Tailwind class sorting
  (`sortTailwindcss` against each package's theme, `tv()` strings
  included). Root prose (ADRs, `CONTEXT.md`, plans, changesets) and
  generated, committed files are ignored.
- **No warn tier.** Every rule is `error` or `off`; the gate runs with
  `--deny-warnings` / `--max-warnings 0`.
- **One word, one meaning.** At the root, `pnpm lint` runs oxlint, ESLint,
  every guard and the example parity; `pnpm format` writes, and
  `pnpm format:check` checks. `pnpm fix` runs both fixers. csc-ui's guard
  aggregate is `lint:guards`.
- **Enforced in the editor, in a pre-commit hook and in CI.** VS Code and
  Zed are configured in the repo. The hook only checks the staged paths and
  never writes files or touches the index. Type-checking is unchanged
  (vue-tsc, ADR-0049).

## Alternatives considered

- **The MyCSC model**: ESLint keeps its whole config minus the rules oxlint
  covers (`eslint-plugin-oxlint`). It is proven and uses no alpha features,
  but ESLint still parses every file and each script has two linters. It
  stays the fallback if a `jsPlugins` upgrade breaks: move perfectionist and
  `@stylistic` back into ESLint.
- **Drop the rules oxlint lacks**: the smallest toolchain, but it loses the
  alphabetical-order and blank-line conventions the codebase already
  follows.
- **Perfectionist in csc-ui only, or with examples exempt**: canon
  examples would keep their teaching order, but the packages would keep
  differing, and sorting the canon without its variants would show each
  flavor's keys in a different order.
- **An autofixing hook (lint-staged)**: smoother, but its `git stash`
  backup of partially staged files has failed silently in this repo when
  `.git/index.lock` is stale or an editor rewrites the index.
- **Widen the rules (`suspicious`, `pedantic`, the vitest plugin) in the
  same change**: roughly 125 more `suspicious` findings and 870 `pedantic`;
  the vitest plugin's 105 were mostly false positives (two-argument
  `expect`, assertions inside harness helpers, parametrised conformance
  suites). The switch changes tools, not standards; widening is a later
  decision.

## Consequences

- The `jsPlugins` rules run in oxlint's JS runtime, so the editor's oxc
  language server must start oxlint from `node_modules`, not from a
  bundled binary.
- The docs site imports the library theme from csc-ui's build, so oxfmt
  sorts its classes against `app/assets/tailwind-sort.css`, which imports the
  same theme from csc-ui's source: formatting then never needs a build.
- A Tailwind upgrade can re-sort class lists; review those diffs like a
  format change.
- Generated, committed files (`tag-name-map.ts`, `theme/chart-data.ts`,
  `api.snapshot.json`, the React wrapper's generated sources) are ignored
  by both tools, so regeneration never fights the formatter.
- The hook checks the working-tree copy of each staged path, so a partly
  staged file is judged by its unstaged edits too.
