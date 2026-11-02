# 74. The public API is the manifest plus the package exports

Date: 2026-10-23

## Status

Accepted. Lands before `4.0.0-rc.1` (`_plan/csc-ui-4-stable-release.md`).

## Context

Leaving the alphas puts csc-ui under semver, but nothing said what the
version number makes promises about. Consumers customise through `::part()`
only (ADR-0006), theme through semantic tokens (ADR-0010, ADR-0011, ADR-0018)
and translate through `texts`, so a promise covering only tags, attributes and
events would leave the main customisation routes unprotected. The strict
analyzer already publishes a complete per-tag description
(`custom-elements.json`), and the **API snapshot** spec already fails on any
change to it, but a reviewer still decides by eye whether a diff is breaking.

## Decision

- **The public API** is everything the **manifest** publishes per tag (tag
  name; attributes and properties with their types and **built-in defaults**;
  events; slots; **parts**; CSS states; methods), the `texts` keys, the
  exported TypeScript types, the `css/*` files and the **semantic token**
  names.
- **Breaking** is removing, renaming or narrowing any of it, or changing a
  built-in default. Adding is a minor change.
- **Not public:** shadow DOM structure, internal classes, anything marked
  internal (tags, props, events, slots, methods — ADR-0075), pixel appearance
  and the default `texts` strings. A visual change is never breaking.
- **A guard enforces it.** It diffs every changed `api.snapshot.json` against
  the base branch and classifies the changes: added is minor; removed, renamed,
  a type changed other than by widening a union, or a changed built-in default
  is breaking. A breaking diff needs a `major` changeset. While the release
  candidate is out it fails outright.
- **Evolving the API in 4.x** follows the additive path: add the new name in a
  minor, mark the old one `@deprecated` (manifest, IDE data, React JSDoc) and
  remove it in the next major. Everything that has no such path, or that only
  the alphas used, was fixed before 4.0.0 from a full manifest audit
  (`_plan/csc-ui-4-api-audit/`).

## Consequences

- Every part name, `texts` key and token name is frozen until 5.0. Renaming a
  part means exposing both names for a major's lifetime.
- Package-level exported types are guarded too, so the entry snapshot
  records each type's shape (an interface's fields, an alias's text): a
  renamed `texts` key or a narrowed alias is a breaking diff.
- Maintainer tooling (`migratedTags`, `tailwindVariantTags`) leaves the
  package entry: anything exported is public by this rule.
