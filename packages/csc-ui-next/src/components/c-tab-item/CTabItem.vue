<template>
  <div ref="inner" :class="{ active }">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, useHost, useTemplateRef } from 'vue';

const props = defineProps({
  value: { type: [Number, String], default: 0 },
  active: { type: Boolean, default: false },
});

const host = useHost();
const inner = useTemplateRef<HTMLElement>('inner');

// Notify c-tab-items when our content resizes so it can re-measure the
// active panel offset and keep the slide position correct.
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  host?.setAttribute('role', 'tabpanel');
  if (inner.value) {
    resizeObserver = new ResizeObserver(() => {
      host?.dispatchEvent(
        new CustomEvent('contentChange', { bubbles: true, composed: true }),
      );
    });
    resizeObserver.observe(inner.value);
  }
});

onBeforeUnmount(() => resizeObserver?.disconnect());
</script>

<style>
:host {
  --_c-tab-item-padding: var(--c-tab-item-padding, 16px 0 0 0);

  display: block;
  min-width: 100%;
  user-select: none;
}

:host > div {
  padding: var(--_c-tab-item-padding);
}

:host([active]),
:host(.is-active) {
  user-select: auto;
}

/* Hide unless EITHER the `active` attribute (reflected by Vue's prop)
 * OR the `is-active` class (toggled imperatively by c-tab-items as a
 * defensive measure when Vue's prop reflection doesn't land) is set. */
:host(:not([active]):not(.is-active)) > div {
  display: none;
}

:host([disabled]) {
  min-width: 0;
  width: 0;
  overflow: hidden;
}
</style>
