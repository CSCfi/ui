<template>
  <c-icon-button :class="ui.root()" part="root" text>
    <c-icon :path="menuIcon" />
  </c-icon-button>
</template>

<script setup lang="ts">
/**
 * @csspart root - The inner c-icon-button carrying the menu icon
 */
import { mdiMenu } from '@mdi/js';
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config. The
 * old `--c-navigation-button-color` indirection (and the dead
 * `--c-icon-button-text-text-color` child var) are dropped: the colour is set
 * with a text-colour utility on the `root` element, which cascades into the
 * child `c-icon-button`/`c-icon` via `currentColor`. Customization is via
 * `::part(root)`. The host stays `display:contents` (global); the
 * `root` element carries the visual box.
 */
const navigationButton = tv({
  slots: {
    root: 'block mr-0 cursor-pointer select-none rounded-full text-[var(--c-text-system)]',
  },
});

// The `root` is a `<c-icon-button>` which renders a real, natively-focusable
// `<button>` — so keyboard access is already covered. The host is
// `display:contents` (unfocusable), so a host-level `tabindex="0"` did nothing
// on its own but, via defineCustomElement's attribute fallthrough, leaked onto
// `<c-icon-button>` and turned it into a *second* tab stop (host id leaked the
// same way). Don't set tabindex here, and suppress the fallthrough entirely.
defineOptions({ inheritAttrs: false });

const ui = computed(() => navigationButton());

const menuIcon = mdiMenu;
</script>
