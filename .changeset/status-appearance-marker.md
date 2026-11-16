---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

`c-status` has a softer look and three new options. `appearance="outlined"`
keeps the ground behind the pill, with a grey edge and plain text.
`marker="icon"` puts the status icon on a tinted halo before the text, and
`marker="dot"` a dot in the status colour. `size` adds `small` (20px) and
`large` (32px) to the 24px default. All three take an app default
(`applyDefaults({ 'c-status': { marker: 'dot' } })`), and `marker="none"`
takes the marker off a single pill. An icon in the new `icon` slot replaces
the marker and is sized to match the pill.

The pill is now as wide as its text and no longer at least 88px wide. To keep
pills in a column the same width, set
`c-status::part(root) { min-width: 88px; }`.
