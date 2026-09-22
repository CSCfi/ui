The page shell of an application: it paints the page canvas and lays out the toolbar, the side navigation and the page in the dashboard layout. It is at least a viewport tall and grows with its content, so the document — not a component — is what scrolls.

## Dashboard layout

Slot the layout components as direct children and `c-main` places them: `c-toolbar` spans the top, `c-side-navigation` takes the left column and `c-page` fills the rest. The toolbar pins itself to the top of the viewport; `c-main` pins the desktop side navigation beneath it and moves its pin to the top edge when the toolbar is `static`. The drawer is sized to the pinned height: a short menu fills the column, a long one scrolls inside the drawer, and the side navigation's bottom slot stays at the bottom edge of the viewport — also while a banner or a static toolbar is still above the drawer. The 3.x `autoheight` host class is ignored here, and the mobile drawer is not touched. The drawer never adds to the layout's height: a page that fits the viewport is exactly a viewport tall and does not scroll, with or without a banner, pinned or static toolbar.

## Banner

A full-width message strip above the toolbar — a service notice, an environment warning — goes in the `banner` slot. Slot a `c-alert` or your own markup; `c-main` only places it. The banner scrolls away with the page and the toolbar pins in its place. This is a message strip, not the ARIA `banner` landmark.

## Disabling the layout

`disable-layout` turns the grid into a plain column, still at least a viewport tall, for pages that arrange their own chrome. The banner slot renders first in the column.

## Scrolling

The document scrolls, so browser scroll restoration, anchors, find-in-page and mobile browser chrome all behave natively, and a modal inside `c-main` stops the page behind it. `c-page` has no fixed height and no scrollbar of its own; its `scroll-indicator` tracks the document. Set `html { scroll-behavior: smooth }` for smooth anchor scrolling.

## Customization

Structural styling via `::part(root)`, the shell box; the dashboard grid inside it is not a part. Anything that paints below the shell's bottom edge is clipped rather than lengthening the page. To show the layout inside a bounded box — a demo, a preview — give the part a height together with `min-height: 0` and `overflow-y: auto`, and set `--c-main-viewport-height` to the same height so the pinned side navigation is sized to the box instead of the viewport; the toolbar and side navigation then pin inside that box.
