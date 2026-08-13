# 18. Consumer-facing Tailwind theme export, semantic roles only

Date: 2026-07-07

## Status

Accepted

## Context

Until now, a consumer styling their own UI with the design system's colours had
exactly one integration point: the raw `--c-*` custom properties from
`@cscfi/csc-ui-next/css/tokens.css`. For Tailwind-using consumers that means
arbitrary-value classes (`bg-(--c-surface)`) or a hand-rolled `@theme` mapping
— and every hand-rolled copy drifts as roles are added.

The first such consumer is our own documentation site
(`csc-ui-documentation-next`), which is migrating its site chrome from plain
CSS to Tailwind v4 and needs utilities like `bg-surface` / `text-on-surface`
that stay mode-aware across the `data-theme` switch. The library already
maintains exactly this mapping internally (`src/tailwind.css`, ADR-0004/0010),
but it was not published.

Two questions had to be settled: whether the library should export the mapping
at all, and if so whether it should include the raw palette-step ramps
(`primary-600`, `slate-200`, …) alongside the semantic roles.

## Decision

`@cscfi/csc-ui-next` publishes a consumer-facing Tailwind theme as
`@cscfi/csc-ui-next/css/tailwind-theme.css`, importable from a consumer's own
Tailwind v4 build next to `tokens.css`.

The file contains **semantic roles only**: the surface ladder, `on-*`
foregrounds, `border`/`ring`, and the brand/status roles with their
hover/subtle variants. Raw palette-step ramps are deliberately excluded.

The source of truth lives at `src/styles/css/tailwind-theme.css`; the library's
internal `src/tailwind.css` now `@import`s it, so the internal build and the
published export cannot drift. The existing `copy-styles` step ships it to
`dist/styles/css/`, where the `"./css/*"` package export exposes it — no new
build plumbing.

Alternatives rejected:

- **Docs-local (or per-consumer) copy of the mapping** — two mappings that
  drift silently whenever a role is added to the token set.
- **Exporting palette ramps too** — a palette-step utility resolves to the same
  colour in both modes, so every use is a latent dark-mode bug; this is the
  precise failure ADR-0010 forbids (and CI-guards) inside the library. It would
  also double the stable API surface for no expressible-only-this-way gain: a
  consumer who truly needs a raw step can write `var(--c-primary-600)`, which
  reads as the escape hatch it is.

## Consequences

- The theme file is load-bearing public API: utility names generated from it
  (`bg-surface`, `text-on-surface-muted`, `bg-primary-subtle`, …) are a
  compatibility contract, like parts (ADR-0006).
- Every semantic role added to `tokens/semantic/{light,dark}.json` must get an
  entry in `tailwind-theme.css` or its utility never exists — same KEEP IN SYNC
  obligation the internal map already carried, now with consumer visibility.
- The export requires the consumer to run Tailwind v4 and to load `tokens.css`;
  it is a mapping, not a standalone stylesheet. The planned Customization docs
  page documents this pairing.
- Consumers get dark-mode correctness by construction for anything they build
  with these utilities; a consumer can additionally reset Tailwind's default
  palette (`--color-*: initial`) to make semantic roles the *only* colour
  utilities, which the docs site does.
- The internal `@theme inline` blocks for palette steps, motion, and the
  `rounded-csc-*` utilities remain private to the library build.
