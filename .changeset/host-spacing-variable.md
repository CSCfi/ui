---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Components no longer declare Tailwind's spacing variable on their hosts, so
an app's own Tailwind spacing scale reaches content slotted into them.
