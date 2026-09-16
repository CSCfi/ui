---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-side-navigation`'s bottom slot stays at the drawer's bottom edge. Inside
`c-main` the desktop drawer fills its pinned height, so a short menu no longer
leaves the slot under the last item and the 3.x `autoheight` class is ignored
there (it left the drawer one toolbar height short under a `static` toolbar).
Under a banner or a static toolbar the slot reaches the viewport's bottom edge
before the drawer has pinned. A long menu scrolls on its own above the slot,
which stays visible, on desktop and in the mobile drawer alike; the slot's
content is no longer inside the `menubar` nav. A bounded `c-main` shell with
its own scrollbar declares its height with the new `--c-main-viewport-height`
custom property.
