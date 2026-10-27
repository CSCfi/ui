An icon drawn from a single SVG path, sized in pixels and filled with the
colour of the surrounding text unless given one of its own.

Pass the icon path in `path`: the path data of an icon drawn on a 24×24 grid,
typically an export of `@mdi/js` (Material Design Icons). The icon renders at
24px; `size` sets another width and height in pixels.

```vue
<script setup lang="ts">
import { mdiCheckCircle } from '@mdi/js';
</script>

<template>
  <c-icon :path="mdiCheckCircle" :size="20" />
</template>
```

## Colour

Without `color`, the icon fills with `currentColor`, so it takes the text
colour of its surroundings: inside a `c-button` or `c-icon-button` it follows
the button's appearance and disabled state. To recolour it, set the CSS
`color` on the element or an ancestor, or pass any CSS colour in `color`.
Prefer the semantic tokens, such as `color="var(--c-success)"`, which follow
the theme mode.

## Accessibility

The icon is an unnamed `<svg>` unless the element has an `aria-label`.

- A decorative icon, one beside a visible label that says the same thing:
  set `aria-hidden="true"` on the `c-icon` so screen readers skip it.
- Inside a control named by its `aria-label`, such as a `c-icon-button`, the
  label replaces the icon; nothing more is needed.
- A meaningful icon with no visible text, such as a status shown only as an
  icon: name it with `aria-label` on the `c-icon`, which makes it an image
  (`role="img"`) with that name.

```vue
<c-icon
  :path="mdiCheckCircle"
  aria-label="Completed"
  color="var(--c-success)"
/>
```

## Customization

`::part(root)` is the `<svg>`. Its width and height are set inline from
`size`, so size the icon with the prop. A `color` set on the part recolours
an icon that has no `color` prop of its own.
