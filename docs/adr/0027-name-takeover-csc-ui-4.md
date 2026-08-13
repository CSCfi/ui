# 27. The rewrite takes over the @cscfi/csc-ui name as 4.0.0

Date: 2026-08-12

## Status

Accepted

## Context

The Vue rewrite (`@cscfi/csc-ui-next`, never published to npm) has reached
full component parity with the Stencil library, and the Stencil packages are
being deleted from the repository. The rewrite needs a permanent npm
identity. The existing name `@cscfi/csc-ui` is published at 3.0.19 and is
what consumers already depend on; per the glossary, an upgrade is
all-at-once — both implementations register the same tags, so they can never
coexist in one app.

The alternatives were a fresh package name (clean break, but abandons the
established name, its download history, and search rank while leaving the
old name to rot undeprecated-but-dead) or taking over the existing name with
a major version bump.

## Decision

The rewrite is renamed to `@cscfi/csc-ui` and ships as **4.0.0** — the next
major after the last Stencil release. The `-next` suffix disappears from
package names, directory names, and vocabulary. Existing `^3` ranges never
pull the rewrite in; adopting 4.x is the deliberate, breaking upgrade the
migration guide describes.

The React wrapper likewise takes over `@cscfi/csc-ui-react` and is
**version-locked to the core** (enforced by the release tooling as a fixed
group, not by a publish-time copy script — the old script still let the
wrapper drift to 3.0.13 against a 3.0.19 core). "Wrapper x.y.z wraps core
x.y.z" is the whole compatibility story.

All 3.x versions of `@cscfi/csc-ui` and `@cscfi/csc-ui-react`, plus the
retired `@cscfi/csc-ui-vue` and `@cscfi/csc-ui-vue2` directive wrappers, are
deprecated on npm with pointers to 4.x.

## Consequences

- Published versions are immutable: once 4.0.0 is on npm under this name,
  the identity decision cannot be undone.
- A future reader seeing that 4.x shares no code with 3.x should land here:
  the major version boundary **is** the implementation swap.
- The first release after merging the rewrite to `main` must be exactly
  4.0.0 — the packages carry a 3.0.20 baseline version plus a committed
  major changeset so the normal release pipeline produces that number
  (see ADR-0028).
