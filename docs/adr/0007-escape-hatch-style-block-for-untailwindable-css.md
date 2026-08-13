---
status: accepted
amends: >
  ADR-0004 — its "No per-component CSS" and "Un-Tailwind-able CSS is
  re-architected away, not centralized" decisions are relaxed
---

# Allow a narrow escape-hatch `<style>` block for CSS that utilities cannot express

`tailwind-variants` (`tv`) remains the **default and mandatory** place a component's styling lives.
But a component may also carry a small `<style>` block **restricted to constructs that are
structurally impossible to express as Tailwind utilities** — `::slotted()`, positional/contextual
`:host(...)`, `@keyframes`, and native pseudo-elements (`::-webkit-*` / `::-moz-*`). This relaxes
ADR-0004's "zero per-component CSS / re-architect everything away" stance, which proved too strict
once projected across the whole library.

## Context

ADR-0004 banned all SFC `<style>` blocks and required un-Tailwind-able CSS to be "re-architected
away" (the spinner → `animate-spin`, the icon slot → a wrapper element instead of `::slotted`, the
ripple → a JS `requestAnimationFrame` transition instead of `@keyframes`). Two things became clear
in practice:

- **The "hard" constructs are pervasive, not edge cases.** Across the components still to migrate:
  `::slotted` appears in **21** files, selectored/positional `:host(...)` in **27**, and
  `@keyframes` in **14**. Many have no clean utility equivalent at all — `::slotted` of arbitrary
  consumer-provided content, `:host(:last-child)`, `:host-context()`.
- **The workarounds can be worse than the CSS.** `c-ripple` is ~12 lines of plain CSS (a `:host`
  container + a 4-line `@keyframes`). The "re-architect away" rule turned the equivalent in
  `c-button` into a ~40-line `requestAnimationFrame`-double + `setTimeout` + inline-style-mutation
  dance — more surface area, JS-coupled timing, harder to reason about. The rule produced a
  maintainability regression to satisfy a principle.

The original objection — per-instance `<style>` cost — is also moot: `defineElement` now routes a
component's SFC styles into a **shared per-type `adoptedStyleSheet`** (one sheet per component
*type*, not per instance). A `<style>` block is cheap. And ADR-0004 already kept one CSS rule
(`:host{display:contents}`), so "zero CSS" was never literal — this just right-sizes the exception.

## Decisions worth recording

- **`tv` is still the default and is mandatory for anything a utility can express.** Colors,
  spacing, layout, typography, variant/compound state — all stay in the `tv` config. The `<style>`
  block is not an alternative location for ordinary styling.
- **A `<style>` block is permitted only for the un-Tailwind-able allowlist:**
  - `::slotted(...)` — styling consumer-provided light-DOM children;
  - `:host(...)` selectors that cannot become a variant — positional/contextual (`:host(:last-child)`,
    `:host-context(...)`) and hosts that must themselves be a styled box (e.g. `c-ripple`'s
    positioned, overflow-clipped container). Keep converting `:host([attr])` → a `tv` variant.
  - `@keyframes` and the rule that references them;
  - native pseudo-elements (`::-webkit-slider-thumb`, `::-moz-*`, …) for form controls.
- **Guardrails against drift:**
  - *Only-when-impossible*, never when merely convenient — anything expressible as a utility must
    stay in `tv` (enforced in review; a fuzzy lint can flag style blocks containing properties with
    obvious utility equivalents).
  - *Tokens only* — reference `var(--c-*)` / theme values; no hardcoded colors or sizes.
  - *Keep it small*, with a comment header stating it is the ADR-0007 escape hatch.
- **Cascade is well-defined.** The shared Tailwind sheet is adopted first (lower priority) and the
  per-type SFC sheet second (higher), so a component's `<style>` `:host` correctly overrides the
  global `:host{display:contents}`, and its `.foo.state` rules win over base utilities — matching
  the previous injection order.
- **`c-ripple` is the reference implementation:** static dot styling in `tv` utilities; the `:host`
  container and the `@keyframes` in the escape-hatch `<style>`.

## Considered alternatives

- **Keep ADR-0004 strict (zero `<style>`).** Rejected: forces ~21 `::slotted` and ~27 `:host`
  components into workarounds that range from awkward to impossible, and demonstrably produces worse
  code (the JS ripple).
- **Centralize all `@keyframes` in `tailwind.css` and reference via arbitrary `animate-[…]`
  utilities.** Viable for keyframes specifically (the shared sheet is adopted everywhere, so a
  centrally-declared keyframe resolves in every shadow root) and remains an acceptable option when
  an author prefers it — but it does nothing for `::slotted`/positional `:host`, which are scoped to
  a component's own shadow root and cannot be centralized. So it is a complement, not a replacement.
- **Allow `<style>` freely.** Rejected: loses the token discipline and single-source-of-truth that
  make `tv` worthwhile; the narrow allowlist keeps those for the ~95% of styling that can be
  utilities.

## Consequences

- Styling for a component can now live in two places. Mitigated by the narrow allowlist, the
  tokens-only rule, the comment header, and review/lint — the `<style>` block should be small and
  obviously "the stuff utilities can't do."
- `c-ripple` is converted to the hybrid model as the pilot; other components adopt a `<style>` block
  only where the allowlist applies, keeping everything else in `tv`.
- **Amends ADR-0004**: its "No per-component CSS" and "Un-Tailwind-able CSS is re-architected away"
  decisions are superseded by this bounded escape hatch. ADR-0004's token map, parts, dropped
  `--c-*` vars, and `:host{display:contents}` baseline all stand; ADR-0006 (`::part()`-only consumer
  customization) is unaffected.
