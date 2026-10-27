The dashboard layout's left-hand menu: section titles, navigation items and their sub-items in a drawer that is pinned beside the page on desktop and slides in over it on mobile.

## Titles, items and sub-items

Author the menu as a flat list of `c-side-navigation-title` and `c-side-navigation-item` elements: a title heads the items that follow it, up to the next title.

Write an item's sub-items as `c-sub-navigation-item` children inside it; the item slots them itself, including sub-items added later. An item with sub-items is an expandable parent with a chevron: activating it toggles its `active` state, which shows or hides the sub-items, and activating any top-level item collapses the other parents, so one stays open at a time. A parent only expands and collapses — activating it does not close the mobile drawer. The sub-items of a collapsed parent leave the Tab order.

On a parent, `active` means expanded; on an item without sub-items and on a sub-item it marks the current page (`aria-current="page"`). To mark a page under a parent, set `active` on both:

```html
<c-side-navigation>
  <c-side-navigation-title>My project</c-side-navigation-title>
  <c-side-navigation-item value="dashboard">Dashboard</c-side-navigation-item>
  <c-side-navigation-item value="projects" active>
    Projects
    <c-sub-navigation-item value="active" active>
      Active projects
    </c-sub-navigation-item>
    <c-sub-navigation-item value="archived">
      Archived projects
    </c-sub-navigation-item>
  </c-side-navigation-item>
</c-side-navigation>
```

## Selecting an item

Activating an item — a click, or Enter — fires `select` with `{ value }`, the
item's `value`. Sub-items fire it too, and it bubbles, so one listener on the
navigation can route every item:

```vue
<c-side-navigation @select="navigate($event.detail.value)">
  <c-side-navigation-item
    value="/dashboard"
    :active="route.path === '/dashboard'"
  >
    Dashboard
  </c-side-navigation-item>
</c-side-navigation>
```

The navigation does not mark the current page itself: set `active` on the item, or sub-item, of the page shown, from your router or the URL. The highlight then follows the page, not the click, so a navigation your router cancels leaves it where it was.

## Inside c-main

Slot it as a direct child of `c-main` and the dashboard layout places and pins it: the drawer sits beneath the toolbar — or at the top edge once a `static` toolbar has scrolled away — is sized to the pinned height, and scrolls a long menu on its own. No host class is needed; the 3.x `autoheight` class is ignored there.

## Bottom slot

Trailing content — a sign-out button, a help link — goes in the `bottom` slot. It stays at the drawer's bottom edge while the items scroll above it: the viewport's bottom edge on desktop, the panel's in the mobile drawer. It is reached without scrolling the menu and is not a menu item.

## Mobile

Set `mobile` to render the drawer as a panel that slides in from the right over a backdrop. `open` opens and closes it, and a `c-navigation-button` anywhere on the page toggles it. Whenever the user opens or closes it — the navigation button, the close button, the backdrop, or activating an item, which closes it — the drawer fires `change:open` with the new state. Without `mobile` the drawer is always shown: a `c-navigation-button` and activating an item leave it as it is, and fire nothing.

The open mobile drawer is a modal dialog named "Menu": focus moves to its close button, the page behind it is inert and stops scrolling, and Escape closes it, as the close button and the backdrop do. Closing returns focus to where it was, usually the navigation button.

## Standalone

Outside `c-main` the drawer is an ordinary block that grows with its items. The `autoheight` host class sizes it to the viewport minus the toolbar height and lets its item list scroll, for a shell that pins the drawer itself.

## Accessibility

The navigation is a `<nav>` landmark; an `aria-label` on the element names it, which helps beside other navigation on the page. Items are what they do: an item or sub-item with `href` is a link, one without is a button, and a parent is a disclosure button that reports its sub-items as expanded or collapsed. Tab moves through the items; there is no arrow-key model. The current page carries `aria-current="page"`, and section titles are headings (level 2). The close button's name and the drawer's "Menu" are fixed English strings.

## Customization

Structural styling via `::part(root)` (the drawer) and `::part(nav)` (the scrolling item list). The surface is the `nav-surface` token role; override the tokens to re-theme.
