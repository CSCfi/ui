# 54. An inverting scope resolves the opposite theme mode

Date: 2026-09-17

## Status

Accepted

Extends ADR-0053 (theme modes scope to any element): every decision there
stands — `data-theme` still takes only `light` and `dark`, block order is still
load-bearing, a scope still paints nothing, seeds still do not scope. **Amends
ADR-0053's `themeMode()` clause**: resolution moves from `closest()` to the mode
the cascade publishes. Builds on ADR-0018 (the token surface is a compatibility
contract), which now also governs `--c-mode`.

## Context

A **mode scope** is absolute. `data-theme="dark"` means dark whatever surrounds
it, which is right for "this panel is always dark" and wrong for the commoner
design ask: a hero, a spotlight band, a callout that must always stand *apart*
from the page — dark on a light page, light on a dark one, following whatever
the user picked. Today that needs two variants and a script to choose between
them, which puts the mode back in the consumer's hands after ADR-0053 took it
out.

The obvious shape — a third `data-theme` value — is the one ADR-0053 explicitly
closed:

> **Only `light` and `dark` pin a mode.** Any other value is inert […] a stray
> `data-theme="cupcake"` would otherwise force a light island into someone's
> app.

That rule is load-bearing: DaisyUI and Nuxt Color Mode both put arbitrary theme
names on arbitrary elements, and our selectors are unanchored. Spending a third
value would reopen it.

The harder problem is that inversion is *relative*, and CSS selectors are not.
A pinned scope works by inheritance proximity — it declares every role on
itself, so the nearest one wins at any depth with no specificity arithmetic. An
inverting scope has to know the mode it sits in before it can declare the
opposite, and a descendant-selector pair (`[data-theme='light'] [data-theme-invert]`)
resolves by source order instead, which breaks nesting. The docs site hit
exactly that wall and documented it in `site.css`: "descendant selectors resolve
by source order rather than inheritance proximity, so a selector alone cannot
undo it".

## Decision

**`data-theme-invert` is a separate boolean attribute, relative to the enclosing
mode.** Not a third `data-theme` value. ADR-0053's inertness rule survives
untouched, there is no collision surface with a consumer's own theming system,
and it reads truer: inversion is an operation on the mode, not a mode.

**Every mode block publishes the mode it resolved as `--c-mode`**, a keyword
custom property (`light` or `dark`), declared beside `color-scheme`. Two style
container queries key off it:

```css
@container style(--c-mode: light) {
  [data-theme-invert]:where(:not([data-theme='light']):not([data-theme='dark'])) {
    color-scheme: dark; --c-mode: dark; …dark roles…
  }
}
@container style(--c-mode: dark) {
  [data-theme-invert]:where(:not([data-theme='light']):not([data-theme='dark'])) {
    color-scheme: light; --c-mode: light; …light roles…
  }
}
```

Four things in that are load-bearing, and none is obvious:

- **A style query evaluates against the nearest ANCESTOR container, never the
  element itself.** That is what makes it terminate: the inverting element reads
  the `--c-mode` it *inherited*, then declares the opposite *on itself*. No
  cycle. (Verified: an element that sets `--c-mode` on itself still matches on
  its parent's value.)
- **Nesting therefore works by the same inheritance proximity as a pinned
  scope.** An inverting scope inside an inverting scope reads its parent's
  flipped `--c-mode` and flips back; an inverting scope inside a
  `data-theme="dark"` island resolves against the island, not the document.
- **The `:not()`s repeat on the invert selectors** so an explicit `data-theme`
  on the *same element* wins — pinning beats inverting. HTML attributes are
  unordered, so some tiebreak is needed, and this is the one that keeps "the
  element says what mode it is" the stronger statement.
- **Those guards are wrapped in `:where()`** on the element-level blocks, so
  they stay (0,1,0) like every other mode block. At (0,3,0) they would beat a
  consumer's override — the recipe below is (0,1,0) — on every inverting scope
  no matter how late their sheet loaded, silently, with nothing in the selector
  to explain it. Every mode block being (0,1,0) is what makes "source order
  decides" the whole cascade story a consumer has to learn.
- **`:root` cannot be style-queried** — it has no ancestor container. An
  inverting root is handled instead by two `prefers-color-scheme` blocks, which
  are (0,4,0) and so beat both the light block and the (0,3,0) OS block. That is
  the one place the `:where()` rule above does not apply, and the asymmetry is
  inherited: ADR-0053's OS block already out-specifies a consumer override on
  `:root`.

**`--c-mode` is public.** It is what makes the mechanism nestable, it is what
`themeMode()` reads, and it gives consumers a supported way to write their own
mode-sensitive CSS — `@container style(--c-mode: dark) { … }` — instead of
duplicating our selector chain. Our own docs site had to do that duplication for
its code blocks, complete with a "not covered: a light scope nested inside a
dark root" caveat; `--c-mode` is the answer to that class of problem. Its name
and its two values are a compatibility contract.

**Presence-only semantics.** `[data-theme-invert]` is an attribute-presence
selector, so `data-theme-invert="false"` still inverts, like `hidden`. Remove
the attribute to stop.

**`themeMode()` derives instead of mirrors.** It now reads
`getComputedStyle(el).getPropertyValue('--c-mode')`, falling back to the old
`closest()` + `matchMedia` walk only when there is no computed style. A hand
-written mirror of the cascade was already a maintenance hazard — the emitter's
docblock says "matching `themeMode()`'s resolution" — and with eight blocks and
a rule whose input is the *parent's* computed value, `closest()` structurally
cannot express the answer. Two algorithms that can disagree is the failure mode
to avoid.

This carries a bug fix: `closest()` stops at a shadow root, so
`themeMode(elInsideAShadowRoot)` used to ignore the document's mode and fall
through to the OS preference. Custom properties inherit across the boundary, so
reading `--c-mode` resolves it correctly.

## Alternatives considered

- **A third `data-theme` value (`invert`).** One attribute, one mental model —
  but it reopens ADR-0053's strict-values decision, whose whole point was that a
  consumer's own `data-theme` cannot knock components out of their mode.
- **Descendant-selector pairs** (`[data-theme='light'] [data-theme-invert]`).
  No new CSS features, but they resolve by specificity and source order rather
  than inheritance proximity, so nesting breaks and the `prefers-color-scheme`
  path does not compose. This is the trap `site.css` already documents.
- **Emitting every role as `light-dark()`** and letting an inverting scope
  declare the swapped call. Elegant, and needs no container queries — but it
  re-founds the whole token layer on `color-scheme`, a far larger change to a
  public surface, and an inverting scope could not then flip `color-scheme`
  itself without knowing the ambient mode anyway.
- **A private `--_c-mode`.** Keeps the public surface smaller, but denies
  consumers the one query that would let them stop duplicating our cascade.
- **Counting inversions in JS** to keep `themeMode()` on `closest()`. A second
  cascade implementation that can silently disagree with the first.

## Consequences

- **A hand-written role override must name the new scope too.** An inverting
  scope re-declares every role on itself exactly as a pinned one does, so the
  recipe becomes `:root, [data-theme], [data-theme-invert] { --c-surface: … }`.
  **Seed** overrides are unaffected — they set palette tokens the role still
  points at through `var()`.
- **A mode block that forgets `--c-mode` breaks nesting silently** — a nested
  inverting scope would read a stale mode, invisible to every colour assertion.
  Guarded by a node spec that counts `--c-mode` against `color-scheme`.
- **A mode-specific override cannot reach an inverting scope in one selector.**
  A consumer who writes `[data-theme='dark'] { --c-surface: X }` gets nothing
  inside an inverting scope that resolved dark, and `--c-mode` cannot rescue
  them: the same self-exclusion that makes the mechanism work means
  `@container style(--c-mode: dark)` never matches the element that resolved
  dark. They must repeat the declaration on the matching `@container` block.
  Mode-*invariant* overrides (the `:root, [data-theme], [data-theme-invert]`
  recipe) are unaffected.
- **`data-theme-invert` is light-DOM only.** `tokens.css` is a document
  stylesheet, so the attribute cannot match inside a component's shadow root. A
  component cannot invert itself this way; the mode-invariant `inverse-*` family
  and the **inverted surface** roles remain the answer for that.
- **Re-parenting an inverting scope changes its mode with no attribute
  mutation**, so `observeThemeMode` cannot see it. Re-subscribe if you move one.
  A pinned scope never had this property.
- `tokens.css` grows from 21 KB to 38 KB raw, but only ~1 KB gzipped (+21%) —
  the new blocks are near-duplicates of the existing ones.
- **Where style container queries are unsupported, an inverting scope is
  inert**: the subtree keeps the ambient mode. A no-op, never a half-inverted
  subtree — which holds only because each block declares `color-scheme`,
  `--c-mode` and all 92 roles together. Never split one.
  Style queries are Baseline *newly* available (Chrome 111, Safari 18, Firefox
  most recently in 2026), so this is "ship ahead and degrade", not ADR-0008's
  "ship ahead and polyfill": there is no polyfill, and no CSS feature detection
  either — `@supports` cannot test an at-rule prelude. The root blocks are the
  exception, being plain media queries, so `<html data-theme-invert>` keeps
  working where an element-level scope would not.
- The docs site's own Shiki rules still duplicate the mode predicate and do not
  follow an inverting scope. Left as is — when a live invert demo lands there,
  it becomes the showcase for the `@container style(--c-mode: dark)` recipe.
