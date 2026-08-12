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
