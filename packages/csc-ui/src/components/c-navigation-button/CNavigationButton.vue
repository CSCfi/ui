<template>
  <!-- Expanded or collapsed with the mobile drawer it toggles; nothing beside
       a desktop navigation, which has no drawer. -->
  <c-icon-button
    :aria-expanded="
      navigationDrawer.mobile ? String(navigationDrawer.open) : undefined
    "
    :aria-label="t.label"
    :class="ui.root()"
    part="root"
    text
  >
    <c-icon :path="menuIcon" />
  </c-icon-button>
</template>

<script lang="ts">
/**
 * UI texts of `c-navigation-button`, shallow-merged over the English
 * defaults.
 */
export interface CNavigationButtonTexts {
  /** Accessible name of the button. */
  label?: string;
}

interface CNavigationButtonProps {
  /**
   * UI text overrides (i18n), merged over the English defaults. Objects have
   * no attribute form — bind as a DOM property
   *
   * @defaultable {}
   */
  texts?: CNavigationButtonTexts;
}
</script>

<script setup lang="ts">
/**
 * @csspart root - The inner c-icon-button carrying the menu icon
 */
import { mdiMenu } from '@mdi/js';
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

import { useAppDefault } from '../../shared/appDefaults';
import { navigationDrawer } from '../../shared/navigationDrawer';

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
    root: 'mr-0 block cursor-pointer rounded-full text-on-surface-muted select-none',
  },
});

// The `root` is a `<c-icon-button>` which renders a real, natively-focusable
// `<button>` — so keyboard access is already covered. The host is
// `display:contents` (unfocusable), so a host-level `tabindex="0"` did nothing
// on its own but, via defineCustomElement's attribute fallthrough, leaked onto
// `<c-icon-button>` and turned it into a *second* tab stop (host id leaked the
// same way). Don't set tabindex here, and suppress the fallthrough entirely.
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CNavigationButtonProps>(), {
  texts: undefined,
});

// `texts` resolves own value → app default → built-in, key by key (see
// src/shared/appDefaults.ts).
const appDefault = useAppDefault('c-navigation-button', props);

const DEFAULT_TEXTS: Required<CNavigationButtonTexts> = {
  label: 'Menu',
};

const t = appDefault('texts', DEFAULT_TEXTS);

const ui = computed(() => navigationButton());

const menuIcon = mdiMenu;
</script>
