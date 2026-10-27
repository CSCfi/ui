The routed-content region of the dashboard layout: inside `c-main` it fills the area beside the side navigation and below the toolbar, pads the current view's content and keeps an optional footer at its bottom edge.

Put the view's content in the default slot. The page is a plain region: it grows with its content and never scrolls on its own; the document does.

```html
<c-main>
  <c-toolbar>…</c-toolbar>
  <c-side-navigation>…</c-side-navigation>

  <c-page>
    <h1>Reports</h1>
    …
    <footer slot="footer">CSC – IT Center for Science</footer>
  </c-page>
</c-main>
```

## Placement

Slot the page as a direct child of `c-main`, which places it in the dashboard layout's page area; a layout has one page, and the router swaps the content inside it. With `disable-layout`, `c-main` still stretches the page down to the bottom of the viewport. Outside `c-main` the page is as tall as its content, unless you give it a height.

## Content area

The default slot sits in a container up to 1280px wide, aligned to the start edge of the page area rather than centred. Its padding grows with the viewport: 12px, 16px from 640px wide and 24px from 768px.

## Footer

Content in the `footer` slot goes below the container, outside its padding and width limit. Inside `c-main` the page fills at least the rest of the viewport, so the footer sits at the bottom edge of a short page and follows the content of a long one. The footer element is only as wide as its own content; give it `width: 100%` to span the page area.

## Scroll indicator

`scroll-indicator` adds a 4px primary bar fixed to the top edge of the viewport, whose length shows how far the document has been scrolled. It is visual only and is not announced.

## Customization

`::part(container)` is the content wrapper, where the width limit and padding live:

```css
c-page::part(container) {
  margin-inline: auto;
}
```

`::part(scroll-indicator)` is the scroll indicator's bar. The page has no `root` part; style the `c-page` element itself for its own box.
