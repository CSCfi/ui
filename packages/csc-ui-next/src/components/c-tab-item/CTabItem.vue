<template>
  <div ref="innerRef" :class="ui.root()" part="root">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - Default slot
 *
 * @csspart root - The panel's padded content wrapper
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { onBeforeUnmount, onMounted, useHost, useTemplateRef } from 'vue';

import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-tab-item>`. */
interface CTabItemEvents {
  /**
   * Fired whenever the panel's content is resized, so the parent
   * `<c-tab-items>` can re-measure and keep the slide position correct.
   */
  contentChange: void;
}

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004); customization
 * is via `::part()` (ADR-0006). Only the inner `root` panel's padding is a
 * utility. The host MUST stay a real box here (it is a slotted child whose
 * `min-width:100%` drives c-tab-items' slide math, and its `[active]`/
 * `.is-active`/`[disabled]` state toggles the panel visibility), so those
 * host-level rules remain in the escape-hatch <style> below (ADR-0007).
 */
const tabItem = tv({
  slots: {
    root: 'h-full p-2',
  },
});

const ui = tabItem();

// `role="tabpanel"` is set on the host, and c-tabs sets `id`/`aria-labelledby`
// on it too (the tab's aria-controls points at that host id). Vue's
// defineCustomElement mirrors non-prop host attributes into `$attrs`, which
// would otherwise fall through onto the shadow root `[part=root]` div — nesting
// a duplicate `role="tabpanel"` and duplicating the id. Keep them on the host.
defineOptions({ inheritAttrs: false });

interface CTabItemProps {
  /**
   * Active
   *
   * @seeded from csc-ui — verify
   */
  active?: boolean;
  /**
   * Tab value
   *
   * @seeded from csc-ui — verify
   */
  value?: number | string;
}

withDefaults(defineProps<CTabItemProps>(), {
  active: false,
  value: 0,
});

const host = useHost();

const innerRef = useTemplateRef<HTMLElement>('innerRef');

const emit = useHostEmit<CTabItemEvents>();

// Notify c-tab-items when our content resizes so it can re-measure the
// active panel offset and keep the slide position correct.
let resizeObserver: null | ResizeObserver = null;

onMounted(() => {
  host?.setAttribute('role', 'tabpanel');

  if (innerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      emit('contentChange', undefined, { bubbles: true, composed: true });
    });
    resizeObserver.observe(innerRef.value);
  }
});

onBeforeUnmount(() => resizeObserver?.disconnect());
</script>

<!--
  Escape-hatch CSS (ADR-0007): the host must be a real box because its
  `min-width:100%` is what c-tab-items measures to slide the panel track, and
  its visibility is toggled via the `[active]` attribute (reflected by Vue's
  prop), the `.is-active` class (toggled imperatively by c-tab-items as a
  defensive fallback), and the `[disabled]` attribute — all positional :host
  selectors utilities can't express. This :host overrides the global
  `:host{display:contents}`; the per-type sheet is adopted after the shared
  sheet, so it wins.
-->
<style>
:host {
  display: block;
  min-width: 100%;
  height: 100%;
  user-select: none;
}

:host([active]),
:host(.is-active) {
  user-select: auto;
}

/* Hide unless EITHER the `active` attribute (reflected by Vue's prop)
 * OR the `is-active` class (toggled imperatively by c-tab-items as a
 * defensive measure when Vue's prop reflection doesn't land) is set. */
:host(:not([active]):not(.is-active)) [part='root'] {
  display: none;
}

:host([disabled]) {
  min-width: 0;
  width: 0;
  overflow: hidden;
}
</style>
