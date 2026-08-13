# 26. Component descriptions live in usage.md; the SFC docblock keeps only tags

Date: 2026-08-10

## Status

Accepted

Amends ADR-0012 (changes one row of its metadata-source table: the
component-level description no longer comes from the SFC docblock).

## Context

ADR-0012 sourced the component-level description from the free-text head of
the `<script setup>` docblock, alongside the `@slot`/`@csspart`/`@cssprop`
tags. In practice the components that gained a hand-written `usage.md`
opened it with a paragraph duplicating that docblock description — two
places describing the same component, drifting independently. The direction
is that consumer-facing prose about a component lives in exactly one place:
`usage.md`.

At decision time only ~5 of ~72 components had a `usage.md` (a missing file
was a build warning), so simply deleting docblock descriptions would have
emptied most IDE hovers.

## Decision

- **The manifest description is derived from `usage.md`'s first paragraph.**
  The analyzer reads it at build time; it flows unchanged into
  `custom-elements.json`, the IDE data (VS Code custom-data, web-types), and
  the generated tag-map JSDoc. Every `usage.md` must therefore open with a
  paragraph that stands alone as a hover.
- **The SFC docblock carries only tags** (`@slot`, `@csspart`, `@cssprop`,
  `@subcomponents`, …) — no free-text description. The existing 1:1
  tag-vs-template lint is unchanged.
- **Migration is seed-and-strip**: every component without a `usage.md` gets
  one created with its current docblock description as the opening
  paragraph, then all docblock descriptions are deleted. No content is lost,
  no hover goes empty, and the missing-usage build warnings disappear.
- **The docs page layout is unchanged for readers**: the intro paragraph
  under the H1 keeps rendering the manifest description (now usage ¶1), and
  the Usage section renders `usage.md` minus its first paragraph.

## Alternatives considered

- **Fallback chain** (usage ¶1 if present, else docblock): migration-free
  but keeps two prose sources alive indefinitely.
- **Hard cut** (strip docblocks, no seeding): cleanest pipeline, but ~67
  components would ship empty IDE hovers until someone wrote their prose.
- **Drop the docs-page intro paragraph** and render `usage.md` whole under
  the Usage heading: simpler pipeline (no paragraph split) but every page
  would start with a bare H1 followed immediately by a section heading.

## Consequences

- `usage.md` is promoted from "complementary prose" to the canonical source
  of the component description; editing its first paragraph changes IDE
  hovers and the docs intro.
- Internal-only elements (never consumer-authored, documented nowhere) have
  no consumer to describe to; any prose they need stays as ordinary code
  comments, not a `usage.md`.
- A future contributor will find SFC docblocks with tags but no prose — that
  is by design, not an omission.
