# 53. Theme modes scope to any element, not the document root

Date: 2026-09-16

## Status

Accepted

Amends ADR-0010's activation decision ("the consumer sets `data-theme` on the
document root"). Builds on ADR-0011 (seeds stay global) and ADR-0018 (the token
surface is a compatibility contract).

## Context

A **theme mode** was a document-wide fact. `tokens.css` anchored every semantic
block to `:root`, so `data-theme` meant something only on `<html>`; the glossary
said so outright and the customization guide told consumers to set it there.

Consumers need the opposite of a global switch: a permanently dark hero on a
light page, a panel that keeps its mode whatever the user picked, a single
`<c-button data-theme="dark">`. There was no workaround. `:host-context()` would
cross the shadow boundary but cannot see the `prefers-color-scheme` path, and
Tailwind `dark:` variants cannot cross it at all — which is why components have
no per-mode CSS in the first place.

The mechanism was already there. Nothing inside a shadow root *declares* a
semantic token; it only reads one, and custom properties inherit across the
shadow boundary. So the mode selectors never needed `:root` — they only ever had
it.

## Decision

**Any element carrying `data-theme` opens a mode scope.** Dropping `:root` from
the mode blocks in `utils/createSemanticTheme.cjs` is the entire CSS change; no
component changes at all.

```css
:root, [data-theme='light'] { color-scheme: light; …light roles… }
[data-theme='dark']         { color-scheme: dark;  …dark roles…  }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']):not([data-theme='dark'])
                            { color-scheme: dark;  …dark roles…  }
}
```

Three things in that block are load-bearing and none is obvious:

- **Source order decides the root.** `:root` and `[data-theme='dark']` have the
  same specificity (0,1,0), so `<html data-theme="dark">` resolves dark only
  because the dark block comes later. The blocks must not be reordered.
- **Nesting resolves by inheritance proximity, not specificity.** A scope
  declares every role *on itself*, and an element's own declaration always beats
  an inherited one — so the nearest enclosing scope wins at any depth, with no
  specificity arithmetic and no way for a cascade layer to change the outcome.
- **The media guard names both values** rather than using a bare
  `:not([data-theme])`, which is what makes an unrecognised value fall through
  to the OS instead of being treated as light.

**Only `light` and `dark` pin a mode.** Any other value is inert: a subtree
inherits its ancestor, and at the root the OS decides. `data-theme` is a popular
attribute — DaisyUI and Nuxt Color Mode both put arbitrary theme names on
arbitrary elements — and once our selector is unanchored, a stray
`data-theme="cupcake"` would otherwise force a light island into someone's app.
This retires the old "any value other than `dark` is light" rule, and makes
`<html data-theme="auto">` mean "follow the OS" for free.

**A mode scope re-points colour and paints nothing.** It sets no background, so
a `display: contents` host such as `<c-button data-theme="dark">` stays
transparent. Container authors opt in with `bg-surface text-on-surface`. The
consequence to teach: a `color` resolved *outside* a scope inherits *into* it as
a literal and keeps the outer mode's ink.

**`color-scheme` rides along.** It is inherited and scopes per subtree, so it is
the only mechanism that can make UA chrome — scrollbars, textarea resize
grabbers, autofill, date pickers, `::selection` — follow a pinned mode. The
library never set it, so this also fixes root-level dark mode, where all of that
chrome rendered light.

**Modes scope; seeds do not.** `applyTheme`/`themeToCss` keep writing families
to the document root (ADR-0011). They compose for free: a scope re-declares
roles as `var(--c-slate-800)`, and the palette tokens those point at still come
from `:root`, so a re-branded ramp feeds every scope in both modes.

**`themeMode()` resolves the nearest scope** (`closest()`), and a new
`observeThemeMode(target, onChange)` follows it. Charts cannot scrape the
document for colour (ADR-0030/0040) and the tokens are `oklch()` strings a chart
library cannot parse (ADR-0041), so `themeMode(el)` + `chartSlotsHex[mode]` is
the sanctioned path and had to become element-aware. The documented
`MutationObserver` recipe watched `documentElement` only, which silently misses
a flip on any other ancestor.

## Alternatives considered

- **A namespaced `data-csc-theme` for scoping**, leaving `data-theme` root-only.
  Removes the collision risk outright, at the cost of two attributes meaning the
  same thing and root and subtree behaving differently. Strict values contain
  the same risk without the split.
- **A `<c-theme>` wrapper component.** A component that renders nothing is a CSS
  rule in costume, and it would still need the same selectors underneath.
- **`:host-context([data-theme='dark'])` in components.** Cannot see the
  OS-preference path, and reintroduces the per-component dark variants ADR-0010
  exists to avoid.
- **Auto-painting the scope** (`background: var(--c-surface)` on `[data-theme]`).
  "It just works" for containers, but gives every `display: contents` host an
  opaque box and is a specificity fight consumers must undo.

## Consequences

- **A hand-written semantic-role override at `:root` does not survive into a
  scope.** `:root { --c-surface: … }` is an inherited value inside the scope,
  and the scope declares `--c-surface` on itself; an own declaration always
  wins, and cascade layers cannot change that. Consumers scope their overrides
  the same way: `:root, [data-theme] { --c-surface: … }`. **Seed** overrides are
  unaffected — they set palette tokens the role still points at through `var()`.
- **Behaviour change at the root:** `<html data-theme="<anything else>">`
  rendered light and now follows the OS preference.
- **Visual change in root-level dark mode** from `color-scheme`: UA chrome that
  rendered light now renders dark.
- A `c-toasts` placed outside a scope keeps the page's mode even when the toast
  is raised from inside one. Correct — toasts are page chrome — but surprising.
- The selector shape is public API, guarded by a node spec, and the behaviour by
  `src/theme/modeScope.spec.ts` plus a conformance suite asserting every tag
  paints the same in a scope as under a pinned root.
