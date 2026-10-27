A vertical list of rows, each a `c-list-item` with its main content and optional leading and trailing content, for settings entries, related pages or a short set of records.

Put the row's main content, usually a `c-list-item-title`, in the item's default slot, an icon or other leading content in the `pre` slot and trailing content in the `post` slot. Empty `pre` and `post` slots take no space. The default slot stacks its children, so a title can carry a second line of text under it.

```html
<c-list bordered>
  <c-list-item href="/settings/profile" active>
    <c-list-item-title>Profile</c-list-item-title>
    <span>Name, email and language</span>
  </c-list-item>

  <c-list-item href="/settings/notifications">
    <c-list-item-title>Notifications</c-list-item-title>
  </c-list-item>
</c-list>
```

## When to use

- A short list of rows the user reads or opens: settings sections, related pages, the members of a project.
- For the application's main navigation, use `c-side-navigation`; for a panel of commands, `c-menu`.
- For records with several columns, use `c-data-table` or `c-table`.

## Interactive items

An item is static by default: a row of content with no hover state and no place in the Tab order.

- `href` turns the item's content box into a real link, with focus, Enter, middle-click and open-in-new-tab from the platform, and a hover tint on the row. `target` says where the link opens, as on a native `<a>`: the same tab unless set, `_blank` for a new one.
- `ripple` adds a pointer cursor, the hover tint and a ripple on press, and puts an item without `href` in the Tab order. It does not make the item a button: Enter and Space play the ripple but fire no `click`, so an action that lives only in a `click` listener cannot be reached from the keyboard. Give navigation an `href`, and put an action of its own in a `c-button` in the `post` slot.
- `hoverable` adds the hover tint alone.

## Active and disabled items

`active` marks the current item with a primary tint and an inset primary ring; in a `bordered` list its border turns primary too. The active state is painted only: assistive technology is not told which item is active.

`disabled` greys an item out, a slotted `c-icon` included, ignores the pointer, takes the item out of the Tab order and sets `aria-disabled`. `disabled` on the list disables every item, also items added later. Clearing it re-enables only the items the list disabled, so an item you disabled yourself stays disabled.

## Accessibility

The list has `role="list"` and each item `role="listitem"`, so a screen reader announces the list and how many items it holds. An item with `href` is a link named by its content.

## Customization

`bordered` draws a 1px border with rounded corners around each item. `c-list::part(root)` is the grid holding the items, 4px apart; `c-list-item::part(root)` is an item's content box (a `<div>`, or the `<a>` when `href` is set); `c-list-item-title::part(root)` is the title text.

```css
c-list::part(root) {
  gap: 0;
}
```
