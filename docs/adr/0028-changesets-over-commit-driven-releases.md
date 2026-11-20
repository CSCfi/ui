# 28. Releases driven by changesets, not commit messages

Date: 2026-08-12

## Status

Accepted

## Context

Releases were previously automated with release-please v3 driven by
conventional commits. That setup failed in several ways:

- The workflow was misconfigured (`package-name: release-please-action`,
  copy-pasted from the action's README) and covered only the core package.
- Version numbers jumped unexpectedly — with commit-message-driven
  versioning, a stray `!` or `BREAKING CHANGE` footer silently triggers a
  major.
- The repository's commit convention uses capitalized types
  (`Feat(scope):`, `Fix(scope):`), which conventional-commit tooling does
  not reliably recognize — commits could be invisible to the release tool.
- The final 3.0.20 release was tagged in git but never reached npm; the
  publish failed silently.

The alternatives considered were fixing release-please (v4, manifest mode,
linked-versions — but this forces a lowercase commit convention and keeps
version bumps implicit in commit text) and a manual tag-push workflow (no
automation at all).

## Decision

Versioning and publishing are driven by **changesets**:

- A version bump exists only as an explicit changeset file committed in a
  PR. A major can never happen by accident of commit phrasing; the commit
  convention is irrelevant to releases and stays as it is.
- `@cscfi/csc-ui` and `@cscfi/csc-ui-react` form a **fixed group**: always
  the same version (ADR-0027).
- Merges to `main` update a bot-maintained *Version Packages* PR; merging
  that PR builds and publishes. Releases batch; publishing is one
  deliberate click.
- A blocking CI check requires every PR to carry a changeset; PRs that
  should not release commit an explicit empty changeset
  (`pnpm changeset --empty`), so skipping a release note is visible and
  deliberate.
- Publishing authenticates via **npm trusted publishing (OIDC)** — no
  stored token, so nothing expires and the silent-failure mode of the
  3.0.20 release cannot recur; releases also gain provenance attestations.

## Consequences

- Contributors must write changeset files; the CI check teaches this
  quickly but it is a workflow change.
- The 4.0.0 release is produced by this pipeline from day one: the renamed
  packages carry a 3.0.20 baseline version and a major changeset describing
  the rewrite, so the first Version Packages PR after merge proposes
  exactly 4.0.0.
- npmjs.com must be configured once per package to trust this repository's
  publish workflow (requires package owner rights).

## Amendment (2026-10-23): the road out of pre mode

- The alphas end in a **release candidate**: once the breaking work of
  ADR-0074–0077 has landed, the pre tag switches from `alpha` to `rc`. From
  `4.0.0-rc.1` the API guard (ADR-0074) fails any breaking change, and 4.0.0
  ships when MyCSC runs on the latest RC with no open csc-ui blocker.
- **The 4.0.0 changelog entry is curated.** Before `changeset pre exit`, the
  changesets already released in an alpha are deleted (their text stays under
  each alpha in `CHANGELOG.md`) and one hand-written major changeset describes
  the release for 3.x upgraders, linking the migration guide.
  _Amended 2026-11-17_: the rule covers every prerelease, alpha or rc. By
  rc.8 every changeset on disk had been released in one, and in `exit` mode
  changesets lists each changeset still on disk in the stable entry, so the
  exit PR deletes them all and 4.0.0 carries the curated text alone.
- **3.x is frozen at 3.0.19**; no 3.x version is deprecated on npm. It needs
  no dist-tag, since `@3` resolves to it (_amended 2026-11-20_: npm refuses a
  `v3` tag, which is a valid range). After 4.0.0 the `alpha` and `rc`
  dist-tags are removed, and `@cscfi/csc-ui-vue` / `@cscfi/csc-ui-vue2` are
  deprecated.
- _Amended 2026-11-17_: **an admin merges the Version PR past the required
  checks.** Before the exit PR, `main` starts requiring `build-lint-test`,
  both engine jobs and `require-changeset`, but the release workflow opens
  the Version PR with `GITHUB_TOKEN`, and GitHub starts no workflow for that
  token's events, so those checks never report on it. Its diff is versions
  and changelogs over a `main` that already passed CI; a GitHub App token
  that let CI run there was not worth an org app and two secrets.
