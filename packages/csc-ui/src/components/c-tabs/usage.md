A tab set that switches between panels of related content: a row of `c-tab` headers above the `c-tab-item` panels, one panel shown at a time.

Give each `c-tab` a `value` and the panel it shows the same `value`. The panels go in a `c-tab-items` slotted into `c-tabs` with `slot="items"`. Bind the active value with `value` (or `v-model`); `change` fires with the new value when the user picks another tab.

```html
<c-tabs value="summary">
  <c-tab value="summary">Summary</c-tab>
  <c-tab value="members">Members</c-tab>

  <c-tab-items slot="items">
    <c-tab-item value="summary">…</c-tab-item>
    <c-tab-item value="members">…</c-tab-item>
  </c-tab-items>
</c-tabs>
```

## When to use

- Views of one subject that the user does not need side by side — a project's summary, members and settings.
- For a sequence the user moves through in order, show where they are with `c-steps`.
- For a choice that is a form value, use `c-button-group`, not tabs.

## Value

`value` is the active tab's value. Set it to one of the tabs: with no match, no tab is active, no panel is shown and the tab row has no Tab stop. Values are compared with `===`, and an attribute is always a string, so a tab written `value="2"` does not match a number `2` bound to `c-tabs` — use strings throughout, or bind numbers on the tabs and panels too.

`change` carries the new value when the user activates a different tab: a click, or Enter or Space on a focused tab. Activating the active tab fires nothing, and setting `value` from code fires nothing either.

```vue
<c-tabs :value="tab" @change="tab = $event.detail">…</c-tabs>
```

## Keyboard

Only the active tab is in the Tab order. The Left and Right arrow keys move focus to the previous or next tab, stopping at the first and the last, and scroll a tab that is out of view into the row. Moving focus does not switch panels: Enter or Space activates the focused tab.

## Disabled tabs

Set `disabled` on a `c-tab` to show it greyed out and keep it from being selected by pointer or keyboard. Its panel stays in `c-tab-items` but cannot be reached through the tab.

## Layout

- `justify` places the tabs along the row: `stretch` (the default) grows them to fill it; `start`, `center` and `end` keep each tab at its own width.
- `borderless` removes the line along the tab row.
- `vertical` stacks the tabs in a column beside the panels, marks the active tab with a bar on the column's edge, and slides the panels vertically. When the `c-tabs` element itself is narrower than `mobile-breakpoint` (640px by default — the element's width, not the viewport's), the column moves above the panels. `mobile-breakpoint` does nothing for horizontal tabs, and `justify` does nothing for vertical ones.

## Overflowing tab row

The horizontal tab row is one line and never wraps. When the tabs are wider than the row, arrow buttons appear at both ends; each press scrolls by half the row's width, and on a touch screen the row also pans with a sideways drag (a vertical swipe that starts on the row scrolls the page). A tab that becomes active, or that the arrow keys move to, is scrolled into view. There is no scrollbar. Vertical tabs do not scroll this way.

## Panels

Every panel stays in the DOM; only the active one's content is shown. Content in an inactive panel keeps its state across switches, so a half-filled form is still filled in when the user comes back to it.

## Motion

The underline glides to the active tab and the panels slide into place. `disable-animation` switches both off, and they stop under the reduced-motion preference too.

## Tab buttons

To show the tab list as a segmented control instead of the underlined row, put one `c-tab-buttons` with `c-button` children where the `c-tab` elements would go; each button's `value` names its panel as a tab's would. `c-tabs` still owns `value`, `change` and the panels, while the strip brings its own keyboard handling and sliding indicator (see `c-tab-buttons`). For a segmented control that holds a form value outside tabs, use `c-button-group`.

## Accessibility

`c-tabs` applies the tab pattern's roles: the element is the `tablist`, each `c-tab` a `tab` carrying `aria-selected`, and each `c-tab-item` a `tabpanel`. A tab and its panel point at each other through `aria-controls` and `aria-labelledby`; an `id` you set on a tab or a panel is kept, and the others are generated. When a page holds more than one tab set, give each `c-tabs` an `aria-label` so they can be told apart.

## Customization

The tab row is `::part(container)` (the tabs plus the overflow arrows), with `::part(tabs)` the viewport the tabs scroll inside; `::part(content)` wraps the panels. Each child has a `root` part: `c-tab::part(root)` is the box centring a tab's label, `c-tab-items::part(root)` the track the panels slide on, and `c-tab-item::part(root)` a panel's padded content box.

```css
c-tab-item::part(root) {
  padding: 16px 0;
}
```

Tab labels and the underline use the primary role, a hovered tab the `primary-subtle-hover` fill, and the row's line the `border` role; override the tokens to re-theme.
