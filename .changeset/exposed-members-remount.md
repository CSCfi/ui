---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

A component's methods and read-only properties (`startUploads()`,
`unmaskedValue`, `badInput`, …) keep working after its element leaves the page
and comes back, as under Vue's `<KeepAlive>` or in a reordered list. They
went on reaching the first, unmounted instance (a stale value, a method that
did nothing), and Vue logged an "already exists" warning for each.
