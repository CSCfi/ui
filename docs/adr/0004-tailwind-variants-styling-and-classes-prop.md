---
status: >
  partially superseded by ADR-0006 — the `override` prop and the `@source inline`
  safelist are removed; the `tailwind-variants` authoring system, dropped `--c-*`
  vars, parts, `@theme` token map, and `:host` rule still stand.
  Amended by ADR-0007 — the "no per-component CSS" / "re-architect un-Tailwind-able
  CSS away" decisions are relaxed to allow a narrow escape-hatch `<style>` block
  (::slotted, positional :host, @keyframes, native pseudo-elements)
---

# Tailwind-variants styling, dropped `--c-*` override vars, and the `override` prop

_(Filename slug retains "classes-prop" for link stability; the prop was renamed `classes` → `override`.)_

`csc-ui-next` components drop all per-component CSS. Each migrated SFC loses its `<style>` block; visual styling becomes Tailwind utilities authored through a [`tailwind-variants`](https://www.tailwind-variants.org/) (`tv`) config per component, whose `slots` are the component's **parts** and whose `variants`/`compoundVariants` replace the old `:host([…])` selector matrix. Every component exposes an `override` prop — an object keyed by **part** name whose values **merge with the defaults, consumer-wins** (via the `tailwind-merge` that `tv` bundles). This amends ADR-0003.

## Decisions worth recording

- **No per-component CSS.** SFC `<style>` blocks are removed. `tailwind-variants` is the canonical place a component's styling lives.
- **Per-component `--c-*` override variables are dropped (breaking).** The documented `--c-button-background-color`, `--c-button-ghost-inverted-disabled-background-color`, … surface is removed. Theming now flows through (1) global design tokens and (2) the `override` prop. This is the deliberate trade-off: a breaking change to the documented theming API in exchange for components free of a large hand-maintained custom-property layer.
- **The `override` surface must be safelisted.** The Tailwind sheet is inlined at *library* build time and only contains utilities the library's own components use. A consumer override using a token colour the library never uses (e.g. `bg-tertiary-500`) would have no rule inside the shadow root and render transparent. `tailwind.css` therefore `@source inline`-safelists the override surface: the full design-token palette across the colourable properties (`bg`/`text`/`border`/`ring`/`fill`/`outline`, with `hover:`/`focus-visible:`), plus the common non-colour scales consumers reach for — font size/weight, text alignment, leading/tracking, border radius, spacing (`p`/`m`/`gap`), sizing, display, flex/grid alignment, position, shadow, opacity, cursor. Cost: ~+128 KB on the shared inlined sheet (538→666 KB). A utility outside the safelist that the library doesn't itself use still won't resolve in an override — extend the safelist when that surfaces.
- **Global tokens mapped into Tailwind `@theme`.** Design tokens (`--c-primary-600`, …) are mapped in `tailwind.css` so components author against semantic utilities (`bg-primary-600`). Because the utility resolves through `var(--c-primary-600)`, a consumer overriding that token at `:root` still re-themes at runtime — tokens inherit across the shadow boundary.
- **Host is layout-only; styling lives on an inner root element.** A single shared `:host` display rule in `tailwind.css` is the only irreducible CSS; the host carries no visual styling because utility classes cannot target a shadow host. Each component renders a `root` element inside the shadow root that carries the utilities.
- **Parts.** A curated public set per component (not every internal node), named with flat logical names (`root`, `content`, `description`), each stamped as a `part="<name>"` attribute. Purely internal regions (loader, spinner, ripple) are `tv` slots but are **not** parts — no `part=` attribute and no `override` key. The `override` prop keys and CSS `::part()` therefore share one vocabulary. The root element's part is `root`.
- **`override` prop on every component**, including single-part ones (`{ root: '…' }`). Values merge with consumer-wins conflict resolution; they augment, not replace, the defaults.
- **Un-Tailwind-able CSS is re-architected away, not centralized.** Spinner uses `animate-spin`; the icon slot is sized via a wrapper element instead of `::slotted`; the ripple is preserved but driven by a JS-toggled inline-style transition instead of a custom `@keyframes`. The goal is zero bespoke CSS in both SFCs and the shared sheet (beyond the one `:host` display rule).
- **Pilot then batch.** `c-button` is converted first as the locked reference implementation (richest variant/compound matrix, ripple, slotted icon, multiple parts); the rest follow in reviewable batches.

## Considered alternatives

- **Preserve the `--c-*` variables via arbitrary-value utilities** (`bg-[var(--c-button-background-color,var(--c-primary-600))]`) — non-breaking but keeps the large per-component variable layer the rework exists to remove. Rejected in favour of the clean break.
- **`cva` or hand-rolled `computed` + `tailwind-merge`** — `cva` has no native multi-part (`slots`) concept; hand-rolling reimplements compound-variant and slot-merge resolution across ~40 components. `tailwind-variants` models parts + variants + merge in one API.
- **Centralize keyframes/`::slotted` in the shared sheet** rather than re-architecting — honest but reintroduces bespoke CSS, which the rework exists to eliminate.

## Consequences

- **Breaking for consumers theming via `--c-*` variables.** They migrate to global token overrides at `:root` or the `override` prop. Folded into the existing `csc-ui-next` major-version break (ADR-0003).
- **New dependency: `tailwind-variants`** (supersedes a standalone `tailwind-merge`). Component styling config becomes coupled to `tv`'s API — accepted lock-in.
- **`::part()` overrides keep working** because part names are now stamped as `part=` attributes (ADR-0003's promise, previously unimplemented, is realized here).
- **Amends ADR-0003**: its "Public `--c-button-*` variable names … preserved verbatim" decision is reversed, and its "Tailwind via templates, not `@apply`" detail is refined to "Tailwind via `tailwind-variants` configs."
