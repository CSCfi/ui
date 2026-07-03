<template>
  <main :class="ui.root()" part="root">
    <slot />
  </main>
</template>

<script setup lang="ts">
/**
 * Wrapper component for the whole page
 *
 * @slot default - Contents of the page
 *
 * @csspart root - The main element carrying the page background and dashboard grid layout
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004). The
 * host stays `display:contents` (global); the inner `main` element is the
 * styled `root` box and carries the background, text colour and full-viewport
 * layout. The `disableLayout` prop is a `variant` that swaps the default flex
 * column for the dashboard CSS grid (replacing the old `main.dashboard` rule).
 *
 * The per-component `--c-main-*` override vars are dropped (ADR-0004). The
 * tinted page background and body text author against semantic tokens
 * (`surface-sunken` / `on-surface`, ADR-0010) so they theme in dark mode.
 * `surface-sunken` is the recessed page-canvas role (the backdrop that raised
 * surfaces sit on); it is shared with the active root-level side-nav item so the
 * selection reads as contiguous with the page. Customization is via
 * `::part(root)` (ADR-0006).
 */
const main = tv({
  defaultVariants: {
    disableLayout: false,
  },
  slots: {
    root: 'flex flex-col h-screen bg-surface-sunken text-on-surface',
  },
  variants: {
    disableLayout: {
      // Dashboard grid: toolbar spans the top row, sidenav + page below.
      false: {
        root: "grid gap-0 [grid-template:'toolbar_toolbar'_auto_'sidenav_page'_1fr_/_auto_1fr]",
      },
    },
  },
});

interface CMainProps {
  /**
   * Disable the default dashboard layout
   *
   * @seeded from csc-ui — verify
   */
  disableLayout?: boolean;
}

const props = withDefaults(defineProps<CMainProps>(), {
  disableLayout: false,
});

const ui = computed(() => main({ disableLayout: props.disableLayout }));
</script>

<!--
  Escape-hatch CSS (ADR-0007): `::slotted(...)` styles consumer-provided
  light-DOM children, which Tailwind utilities cannot target. The inherited
  text colour and the dashboard grid-area placement of the slotted layout
  components live here; tokens only, no hardcoded values.
-->
<style>
::slotted(*) {
  color: var(--c-on-surface);
}

main ::slotted(c-toolbar) {
  grid-area: toolbar;
}
main ::slotted(c-page) {
  grid-area: page;
}
main ::slotted(c-side-navigation) {
  grid-area: sidenav;
}
</style>
