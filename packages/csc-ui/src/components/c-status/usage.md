A status pill: a short word naming the state of a record, such as Active,
Pending or Failed, tinted with the colours of its status type.

Put the text in the default slot and pick a `type`. `info`, `success`,
`warning` and `error` paint that status family's colours; omitting `type`
renders a neutral grey pill.

```html
<c-status type="success">Active</c-status>
```

## When to use

- The state of an item in a table cell, list row or card: a job, an account,
  a booking.
- For a message that explains a situation or asks the user to act, use
  `c-alert`: a persistent box in the page flow with a heading, an icon and a
  live-region role.
- For feedback on an action the user just took, use `c-toasts`.
- For items in a set that the user picks or removes, use `c-tag` elements in
  a `c-tags`; a status pill is not interactive.
- For a count on another element, use `c-badge`.

## Appearances

`appearance` sets how the pill reads. `filled` (the default) paints the status
family's tint, its text in the tint's ink and its edge in a lighter shade of
the status colour. `outlined` keeps the ground behind the pill, with a grey
edge and plain text, so only the marker carries the colour: use it where a
column of filled pills would crowd a view with colour.

## Markers

`marker` puts a symbol before the text:

- `icon`: the status icon on a tinted halo, the same icon `c-alert` and
  `c-toast` draw for the status. A neutral pill's halo holds a dot.
- `dot`: a dot in the status colour.
- `none` (the default): text only.

```html
<c-status type="warning" marker="icon">Expiring</c-status>
<c-status type="success" appearance="outlined" marker="dot">Active</c-status>
```

For a state the status icons do not fit, put your own icon in the `icon` slot.
It replaces the marker whatever `marker` says, sits in the same halo and takes
the marker's colour. The pill sizes it to match the status icons: 14px, or
11px on a small pill and 18px on a large one, whatever the icon's own `size`.
A plain `<svg>` or `<img>` works too.

```html
<c-status type="info">
  <c-icon
    slot="icon"
    path="M3,3H21V7H3V3M4,8H20V21H4V8M9.5,11A0.5,0.5 0 0,0 9,11.5V13H15V11.5A0.5,0.5 0 0,0 14.5,11H9.5Z"
  ></c-icon>
  Archived
</c-status>
```

## Sizes

`size` is `small` (20px tall), `default` (24px) or `large` (32px), for a state
beside a page or card heading. The pill is as wide as its text; to line up
pills of different lengths in a column, give them a common minimum width:

```css
c-status::part(root) {
  min-width: 88px;
}
```

## App defaults

`appearance`, `marker` and `size` take an app default, so an app sets its
house style once:
`applyDefaults({ 'c-status': { appearance: 'outlined', marker: 'dot' } })`. A
pill's own attribute wins, and `marker="none"` takes the marker off one pill.

## Accessibility

The pill has no role and is not focusable: assistive technology reads its
text inline, and its colour is not conveyed. The marker, a slotted icon
included, is hidden from assistive technology. Make the text name the state
on its own. A changed status is not announced; when the user must hear about
the change, tell them through a live region, such as a `c-alert` or a toast.

## Customization

`::part(root)` is the pill and `::part(marker)` its marker: the icon's halo, or
the dot. The icon and the dot draw in `currentColor`, so setting `color` on the
marker part recolours them; the halo is the part's background.

The filled pill takes the status family's `*-subtle` fill and `on-*-subtle`
ink, and its edge is the status colour mixed into that fill.

```css
c-status::part(marker) {
  color: var(--my-brand);
}
```
