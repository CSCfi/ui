A navigation aid naming where the current page sits in a site's hierarchy: one line of crumbs from the top of the hierarchy down to the current page, the middle ones folding behind a "…" button when the line runs out of room.

## Crumbs

Each `c-breadcrumb-item` is a crumb, written in order from the top of the
hierarchy down. A crumb with an `href` is a link; the last crumb is always the
current page — shown as plain text and announced as the current page, with no
attribute to set — and a crumb without an `href` names a level that has no page
of its own. An icon goes in a crumb's `icon` slot; give an icon-only crumb an
`aria-label`, which names its link:

```vue
<c-breadcrumb>
  <c-breadcrumb-item aria-label="Home" href="/">
    <c-icon slot="icon" :path="mdiHome" />
  </c-breadcrumb-item>

  <c-breadcrumb-item href="/projects">Projects</c-breadcrumb-item>

  <c-breadcrumb-item>Project #1</c-breadcrumb-item>
</c-breadcrumb>
```

The chevron between crumbs is drawn by the breadcrumb and is not configurable.

## Folding

The breadcrumb is always one line, as wide as the space it is given. When its
crumbs do not fit, the middle ones fold behind a "…" button, the crumb nearest
the first one first; the first crumb and the current crumb never fold. The
button opens a panel listing the folded crumbs as links: Tab or the up and
down arrow keys move through them, Home and End jump to the first and the last,
and Escape or a press outside closes it. The down or up arrow on the button
opens the panel straight onto its first or last crumb. Once nothing more can
fold, the current crumb's label shortens with an ellipsis, then the first
crumb's; a shortened crumb shows its full label as a tooltip.

The breadcrumb assigns its crumbs to slots to fold them — never set `slot` on a
crumb yourself. In a flex row, let the breadcrumb take the remaining space so
it can unfold again when the row grows:

```css
c-breadcrumb::part(root) {
  flex: 1;
  min-width: 0;
}
```

## Single-page apps

A crumb is a real link, so it opens in a new tab and can be copied. To route
inside a single-page app, keep the `href` and intercept the crumb's click — it
also fires for Enter, and for a crumb in the fold panel:

```vue
<c-breadcrumb-item
  href="/projects"
  @click.exact.prevent="router.push('/projects')"
>
  Projects
</c-breadcrumb-item>
```

The `.exact` modifier leaves Ctrl-, Cmd- and Shift-clicks to the browser.

## Texts

The navigation's accessible name and the "…" button's label can be replaced
for another language through the `texts` object, merged over the English
defaults. The button's label is a function of the number of folded crumbs, so
the object must be bound as a DOM property:

```vue
<c-breadcrumb
  :texts="{
    breadcrumb: 'Murupolku',
    fold: (count) => `Näytä ${count} lisää`,
  }"
/>
```

To translate every breadcrumb at once, set `texts` app-wide with
`applyDefaults({ 'c-breadcrumb': { texts } })` (Customization → App-wide prop
defaults); a per-instance `texts` still wins key by key.

## Customization

Crumbs expose the `current` and `folded` custom states, so a crumb can be
restyled per state:

```css
c-breadcrumb-item:state(current)::part(content) {
  font-weight: 400;
}
```

The fold panel hides its scrollbar and ends on a half-visible crumb when it
overflows. To bring the native scrollbar back:

```css
c-breadcrumb::part(panel-list) {
  scrollbar-width: auto;
}
```
