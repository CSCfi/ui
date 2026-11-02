---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Screen readers read a control's hint and error message with it. The form
fields, `c-checkbox`, `c-radio-group` and `c-file-upload` showed the text
below the control but never linked it, so it was announced only to someone
reading the page line by line; the control is now described by it
(`aria-describedby`). The fields also gain a `message` part for that text,
which `::part(message)` styles.
