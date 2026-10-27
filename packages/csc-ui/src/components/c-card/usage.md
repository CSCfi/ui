A raised, bordered surface that groups one piece of content — its heading, body and actions — into a single box on the page.

Build the card from its sections, in this order: `c-card-title` for the heading, `c-card-content` for the body and `c-card-actions` for the row of actions. Each section is optional; the card spaces them evenly and pads them in from its edges.

```html
<c-card>
  <c-card-title>Project members</c-card-title>

  <c-card-content>
    <p>Manage who has access to this project and what they can do.</p>
  </c-card-content>

  <c-card-actions justify="end">
    <c-button text>Cancel</c-button>
    <c-button>Save</c-button>
  </c-card-actions>
</c-card>
```

## When to use

- To group a self-contained part of a page: a summary, a settings form, a list with its actions.
- As the content of a `c-modal`, where the card's heading, body and actions become the dialog's.
- For a sign-in page, use `c-login-card`, with its larger heading and background image.
- For a status message, use `c-alert`, which carries the status colours and announces itself.

## Sections

- `c-card-title` sets the heading in small uppercase type above a short primary accent bar. Controls in its `actions` slot sit at the right of the heading, and move onto their own line under it, starting at the left, once the two no longer fit side by side.
- `c-card-content` stacks its children in a column, spaced like the sections themselves.
- `c-card-actions` lays its children out in a row that wraps onto further rows instead of overflowing the card. `justify` distributes them along the row — `start` (the default), `center`, `end`, `space-between`, `space-around`, or `stretch`, which grows every action to share the row — and `align` places them across it: `center` (the default), `start` or `end`. A `c-button` with `fit` grows whatever `justify` is.

Content slotted straight into the card, outside a section, keeps the vertical spacing but gets no inline padding: it runs edge to edge between the card's borders.

## Fullscreen

`fullscreen` adds a round toggle button in the card's top-right corner. Pressing it shows the card in the browser's fullscreen mode; pressing it again, or Escape, returns the card to the page. In fullscreen the card fills the screen with square corners and scrolls its own content. The toggle sits over the end of the heading row, so keep a fullscreen card's heading short and its `actions` slot empty.

`enterFullscreen()` and `exitFullscreen()` do the same from code, with or without the toggle. A browser grants fullscreen only in response to a user action, so call `enterFullscreen()` from a click handler; a refused request logs a console warning and the card stays on the page.

## Accessibility

The card is an `<article>`. `c-card-title` sets its text in a paragraph, not a heading element, so card headings do not appear in the page's heading outline. The fullscreen toggle is a native button whose name and tooltip, "Enter fullscreen" or "Exit fullscreen", follow its state; the text is fixed English.

## Customization

`::part(root)` is the card's visible box: the background and its ink, the border, corner radius, shadow and the spacing between sections all live on it. `::part(fullscreen-toggle)` is the toggle button. Each section has parts of its own, listed with it below.

```css
c-card::part(root) {
  box-shadow: none;
}
```

A card that pins its own theme mode with `data-theme="light"` or `data-theme="dark"` repaints its surface and the ink of everything slotted into it.
