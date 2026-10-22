# 72. Components inherit the page's typography

Date: 2026-10-21

## Status

Accepted

## Context

MyCSC's migration to csc-ui 4 found most of its app drawn in the operating
system's font. The shared shadow sheet imports all of Tailwind, so every host
gets two rules meant for a document root:

- Preflight's `html, :host` rule sets `font-family` (Tailwind's system stack),
  `line-height: 1.5`, `font-feature-settings`, `font-variation-settings`,
  `tab-size`, `-webkit-text-size-adjust` and `-webkit-tap-highlight-color`.
- The theme layer's `:root, :host` rule declares about 60 variables
  (`--font-sans`, `--default-font-family`, `--spacing`, `--text-*`,
  `--radius-*`, …) under Tailwind's own names.

Both are inherited. Slotted content inherits through the flat tree (slot →
root element → host), so text slotted into `c-main`, a card or a modal took
csc's font and line-height instead of the page's, and a consumer's Tailwind v4
`font-sans` or `p-4` inside a component resolved against csc's variables, not
the consumer's theme. A consumer can override a top-level host from its own
stylesheet, but hosts nested in another component's shadow root (`c-select`'s
option rows) are out of reach.

The `--c-font-family` token (`'museo-sans', sans-serif`) did not help: only
about 25 native buttons and inputs, which do not inherit fonts, painted it.
Every other piece of component text used the system stack.

## Decision

- **Hosts pass the page typography through.** The one shared `:host` rule in
  `tailwind.css` declares `font: inherit` (family, size, weight, line height)
  and inherits both feature settings, `tab-size` and
  `-webkit-text-size-adjust`. It is unlayered, so it beats preflight's layered
  rule. Font size, weight and colour
  already came from the page; now everything typographic does.
- **No font token.** `--c-font-family` is removed from the token source and
  every export. Native controls inside shadow roots take `font-family:
  inherit`. A consumer who wants components in a different typeface sets
  `font-family` on the `c-*` element, which outranks `:host`.
- **No Tailwind theme variables on hosts.** The default theme and the library's
  own `@theme` values are imported `inline`, so utilities carry literal values
  and the sheet declares nothing on `:host` that a consumer's Tailwind theme
  could also declare. Values read through `var()` by escape-hatch CSS or
  arbitrary values (the **control height**) move to a private `--_c-` name.
- **Tap highlight stays off on interactive internals only.** It is set on the
  shadow's buttons, links and focusable elements, never on an ancestor of a
  content slot.
- **Components pin typography where their design calls for it**, on the root
  element or their text elements (`c-button`'s `text-base`, `c-alert`'s
  `text-sm leading-normal`). That reaches slotted content too, by design.
- **The page is the test fixture.** `harness.css` gives the body the old
  system stack and `line-height: 1.5`, and the docs example preview frame pins
  `line-height: 1.5`, so baselines and previews match a page with a typical
  reset. The all-components conformance suite mounts every tag under a stage
  with distinctive typography and requires the host to compute the stage's
  values.

## Considered options

- **Paint `--c-font-family` on every host.** Enforces the brand font, but
  slotted content still ignores the page unless the consumer mirrors their
  body font into the token. The same bug with a different typeface.
- **Paint the token, with the page font when it is unset.** Removing the
  default makes an undefined token fall back to inheritance. Rejected as two
  ways to set one thing; setting the token still overrode slotted content.
- **Keep the token as a brand value nothing reads.** A `--c-*` token that
  components ignore misleads 3.x consumers who set it.
- **Move the preflight defaults onto the `root` part.** Themeable through
  `::part(root)`, but the root is an ancestor of every slot, so containers
  would still impose them on slotted content. Inherited properties were
  already overridable on the host.
- **Pin 1.5 only on components whose slots hold labels.** Needs a label slot
  versus content slot classification for every component, which drifts as
  slots change.
- **Strip `:host` from preflight at build, or vendor a shadow preflight.** The
  first rewrites a third-party sheet and breaks silently on a format change.
  The second drifts on every Tailwind upgrade. The conformance check covers
  the override's weakness, a property Tailwind adds later.

## Consequences

- On a page with no font of its own, components draw in the browser default
  (serif), like native elements. The library cannot ship a safe fallback: an
  unlayered `:where(html)` rule in `tokens.css` would beat a consumer's
  layered preflight. Getting started tells consumers to set a body font.
- Component text that pins no leading follows the page's line height. Pages
  with Tailwind preflight or a 1.5 reset see no change.
- MyCSC's `:where(body *) { font-family: inherit }` workaround becomes
  removable, and its nested hosts render in Noto Sans.
- Removing `--c-font-family` is breaking for consumers who set it. A consumer
  whose token matched their body font sees no change.
