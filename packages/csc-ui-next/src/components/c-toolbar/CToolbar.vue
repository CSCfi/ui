<template>
  <div :class="ui.root()" part="root">
    <slot />
  </div>

  <div :class="ui.spacer()" />
</template>

<script setup lang="ts">
/**
 * @slot default - Content of toolbar
 * @csspart root - The toolbar bar itself, fixed to the top of the viewport
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004); the
 * per-component `--c-toolbar-*` override variables are dropped in favour of the
 * global design tokens (`bg-white`, `--c-text-system`). Consumer customization
 * is via `::part()` (ADR-0006).
 *
 * The host is `display:contents` globally, so the fixed bar lives on the inner
 * `root` element. The only thing that can't be a utility — the contextual
 * `:host(.relative) .c-toolbar` selector that flips the bar to in-flow
 * positioning — stays in the escape-hatch <style> below (ADR-0007).
 */
const toolbar = tv({
  slots: {
    // Fixed bar pinned to the top, full width, with the CSC drop shadow.
    root: 'fixed z-10 flex w-full h-[60px] items-center gap-x-3 px-4 bg-surface-raised text-on-surface-muted shadow-[2px_4px_10px_#00000029] border-b border-border',
    // Spacer reserves the bar's height in normal flow so content isn't hidden
    // beneath the fixed bar.
    spacer: 'h-[60px] w-full',
  },
});

// Multi-root template (fragment) — keep consumer fallthrough attrs
// (class/style) on the host element instead of tripping the "renders
// fragment" warning.
defineOptions({ inheritAttrs: false });

const ui = computed(() => toolbar());
</script>

<!--
  Escape-hatch CSS (ADR-0007): only the contextual host selector that Tailwind
  utilities cannot express. When the consumer adds `.relative` to the host,
  the bar switches from fixed to in-flow and pulls the following spacer back up.
-->
<style>
:host(.relative) [part='root'] {
  position: relative;
  margin-bottom: -60px;
}
</style>
