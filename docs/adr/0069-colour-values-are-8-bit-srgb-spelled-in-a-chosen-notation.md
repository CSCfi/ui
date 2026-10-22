# 69. Colour values are 8-bit sRGB spelled in a chosen notation

Date: 2026-10-08

## Status

Accepted

Applies ADR-0041 (round-trip emission) and ADR-0011 (culori at runtime) to
`c-color-picker`'s value.

## Context

The todo asks for a colour picker with a toggleable format: hex, rgba and
oklch. A form needs one predictable grammar in its value, while a person
picking a colour wants to edit in the notation they think in. The library
authors its palette in OKLCH but validates and audits it as 8-bit hex
(ADR-0011, ADR-0041), and every colour a page can paint on most screens is
sRGB.

## Decision

- The consumer's `format` (`hex`, `rgb` or `oklch`; built-in `hex`, an app
  default) fixes the value's **notation**, and every emission is in it. The
  panel's **notation switch** only chooses which **channel editor** shows; it
  never emits.
- A colour is four bytes: 8-bit sRGB and 8-bit alpha. Each notation spells
  them at the fewest decimals that round-trip to the same bytes: hex in
  lowercase (`#rrggbb`, `#rrggbbaa`); `rgb(R G B / a)` in the space syntax
  with integer channels; `oklch(L C H / a)` with L and C to at most four
  decimals and H to two — up to six for the few colours at the very edge of
  sRGB (about one in two thousand), where fewer decimals read back to a
  neighbour. Alpha is written only when below 1, at most three decimals. This is ADR-0041's rule with trailing zeros trimmed for people;
  `cssColor()` keeps four fixed decimals for byte parity with `tokens.css`,
  so it is not reused verbatim.
- Text outside sRGB (`oklch(0.7 0.3 150)`, `rgb(300 0 0)`) is gamut-mapped
  when committed: chroma is clamped at the same lightness and hue, with the
  `clampChroma` the ramp core uses for seeds. The field shows the mapped
  spelling.
- Alpha is opt-in (`alpha`, an app default). Without it, typed alpha is
  dropped on commit and the panel has no alpha slider or A channel.
- The field takes any CSS colour culori parses — named colours, `#fff`,
  `hsl()`, legacy `rgba(…)`, `color(display-p3 …)` — plus hex without the
  `#`. It is unmasked. Text that names no colour is **bad input**.

## Alternatives considered

- **The toggle rewrites the value**: toggling alone would emit a change for
  the same colour, and consumers would parse three grammars.
- **No toggle at all**: drops the todo's ask.
- **A float model** (keep the typed OKLCH): the hex and rgb views round, so
  editing in one view and returning moves the digits, and values in
  different notations cannot be compared exactly.
- **`cssColor()`'s fixed four decimals**: byte-identical with the tokens,
  but noisy in a field people read.
- **Out-of-gamut text as bad input**: a pasted P3 colour fails with an error
  the consumer has to word, and rounding at the gamut edge needs a tolerance.
- **An OKLCH-native area** (chroma × lightness at a hue): on-brand, but hex
  and rgb cannot hold the colours it reaches beyond sRGB, and its gamut
  boundary has to be drawn per hue.
- **Alpha always on**: an alpha slider is a trap where an opaque colour is
  needed (tags, `applyTheme` seeds).
- **`notation` or `value-format` as the prop name**: precise, but consumers
  look for `format`.
- **Masked hex typing**: blocks typing any other notation.

## Consequences

- Typed OKLCH can come back with fewer or slightly different digits, because
  it is quantised to the bytes it lands on.
- `format` means two things in the library: the date and time pickers'
  display pattern, which leaves the ISO value alone, and the colour picker's
  notation, which is the value's. CONTEXT.md flags it.
- `transparent` in a picker without `alpha` commits as black, by the same
  rule that drops alpha.
