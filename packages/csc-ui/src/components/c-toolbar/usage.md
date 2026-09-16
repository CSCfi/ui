The app-wide bar at the top of the dashboard layout: the logo, the service name and global actions such as the user menu or log out. It is pinned to the top of the viewport by default and stays there while the page scrolls; `static` keeps it in the page flow so it scrolls away with the content.

## Pinned or static

Pinned is the default: the bar sticks to the top edge of its scroll container — the document in the dashboard layout — as soon as the page scrolls past it. Set `static` to leave the bar in flow instead; it then scrolls away with the page and returns when the user scrolls back to the top. The 3.x `class="relative"` switch is gone; `static` replaces it.

## Inside c-main

In `c-main`'s dashboard layout the toolbar spans both columns above the side navigation and the page, below an optional banner. `c-main` follows the toolbar's mode: the desktop side navigation is pinned beneath a pinned toolbar, or to the top edge once a static toolbar has scrolled away. No extra markup is needed.

## Content

The bar is a horizontal flex row with a small gap. Push trailing actions to the right with `margin-inline-start: auto` on the first of them.

## Customization

Structural styling via `::part(root)`. The height is the library's layout value shared with `c-main`, so changing it on the part does not move the pinned side navigation.
