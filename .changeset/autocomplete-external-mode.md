---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

c-autocomplete gains an external (async) data mode. A new `external` prop
turns internal filtering off so `items` can come from a server, a new
`change:query` event carries the typed query (it also fires with an empty
string whenever the panel opens — use that to load the initial list), and
the panel shows a loading row while `loading` is set with nothing to
display. The selected label now survives `items` swaps. Default filtering
behaviour is unchanged.
