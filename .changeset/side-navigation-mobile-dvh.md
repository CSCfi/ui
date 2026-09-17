---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-side-navigation`'s mobile drawer fits the visible viewport. It was sized
in `vh`, which on a phone is the viewport with the browser chrome collapsed,
so while the address bar was shown the drawer's tail — the last items and the
bottom slot — sat behind it. The drawer is now sized in `dvh` and follows the
browser chrome as it shows and hides.
