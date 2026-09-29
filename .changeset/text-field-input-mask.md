---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Add input masks to `c-text-field`. A `mask` such as `+358 ## ### ####` makes
the typed text follow a pattern (`#` a digit, `A` a letter, `*` either), with
the separators filled in automatically, and a faint guide in the field shows
what is still to be typed (`+358 __ ___ ____`). A mask can end in optional
parts for formats of varying length, like `+358 #####[#######]` for 5–12
digits. The value is the text as shown; the read-only `unmaskedValue` holds
only the typed characters, and `maskComplete` and the `incomplete` custom
state tell whether the required part is filled.
