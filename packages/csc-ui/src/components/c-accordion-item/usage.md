One collapsible section of a `c-accordion`: a header button showing its `heading` (or the `heading` slot) and an optional icon, above the content in the default slot. Place it directly inside the accordion and give it a `value`: the accordion expands items by value and leaves an item without one collapsed.

The icon goes in the `icon` slot, before the heading. The item sizes it to
24px unless the `c-icon` sets its own `size`; a plain `<svg>` or `<img>` is
sized the same.
