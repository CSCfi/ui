A command menu: a transient panel of actions or navigation choices opened from a trigger (the WAI-ARIA menu-button pattern), authored declaratively with slotted `c-menu-item`, `c-menu-label` and `c-divider` elements. Activating an item fires a one-off `select` event and closes the menu; the menu holds no selected value — that is `c-select`'s job.

## Scrolling

A menu taller than the viewport allows scrolls without a scrollbar: the panel
ends on a half-visible item, which is the cue that more items follow, and the
wheel, touch and arrow keys scroll as usual. Submenu panels behave the same.
To bring the native scrollbar back:

```css
c-menu::part(list),
c-menu-item::part(submenu) {
  scrollbar-width: auto;
}
```
