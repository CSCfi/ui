The dashboard layout's left-hand menu: section titles, navigation items and their sub-items in a drawer that is pinned beside the page on desktop and slides in over it on mobile.

## Inside c-main

Slot it as a direct child of `c-main` and the dashboard layout places and pins it: the drawer sits beneath the toolbar — or at the top edge once a `static` toolbar has scrolled away — is sized to the pinned height, and scrolls a long menu on its own. No host class is needed; the 3.x `autoheight` class is ignored there.

## Bottom slot

Trailing content — a sign-out button, a help link — goes in the `bottom` slot. It stays at the drawer's bottom edge while the items scroll above it: the viewport's bottom edge on desktop, the panel's in the mobile drawer. It is reached without scrolling the menu and is not a menu item.

## Mobile

Set `mobile` to render the drawer as a panel that slides in from the right over a backdrop. `menu-visible` opens and closes it, and a `c-navigation-button` anywhere on the page toggles it. Closing from within — the close button or the backdrop — emits `change:menu-visible`.

## Standalone

Outside `c-main` the drawer is an ordinary block that grows with its items. The `autoheight` host class sizes it to the viewport minus the toolbar height and lets its item list scroll, for a shell that pins the drawer itself.

## Customization

Structural styling via `::part(root)` (the drawer) and `::part(nav)` (the scrolling item list). The surface is the `nav-surface` token role; override the tokens to re-theme.
