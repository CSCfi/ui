<template>
  <div ref="root" class="c-loader" :style="loaderStyle">
    <c-spinner
      :color="'var(--_c-loader-color)'"
      :size="size"
      :width="width"
    />
    <div
      v-show="hasSlotContent"
      class="c-loader__slot"
      :style="{ animationDelay: `${contentdelay}s` }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, useHost, useTemplateRef, watchEffect } from 'vue';
import { useHasSlot } from '../../shared/useHasSlot';

const props = defineProps({
  contentdelay: { type: Number, default: 0 },
  hide: { type: Boolean, default: false },
  size: { type: Number, default: 48 },
  width: { type: Number, default: 4 },
});

const root = useTemplateRef<HTMLElement>('root');
const hasSlotContent = useHasSlot(root, '');
const host = useHost();

// Match Stencil's deferred activation: start hidden, then add the
// `c-loader--active` class on the next frame. This way the
// opacity/scale CSS transition plays on first appearance instead of the
// loader popping in fully visible.
onMounted(() => {
  if (!host) return;
  watchEffect(() => {
    const wantActive = !props.hide;
    requestAnimationFrame(() => {
      host.classList.toggle('c-loader--active', wantActive);
    });
  });
});

const loaderStyle = computed(() => ({
  '--c-loader-size': `${props.size}px`,
}));
</script>

<style>
:host {
  --_c-loader-color: var(--c-loader-color, var(--c-primary-600));
  --_c-loader-background-color: var(
    --c-loader-background-color,
    rgba(var(--c-white-rgb), 0.8)
  );
  --_c-loader-text-color: var(--c-loader-text-color, var(--c-text-system));

  width: 100%;
  position: absolute;
  inset: 0;
  z-index: 6;
  background: var(--_c-loader-background-color);
  border-radius: inherit;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

/* Activation is driven by JS toggling this class on the host element —
 * matches Stencil's componentDidLoad + requestAnimationFrame so the
 * opacity/scale transition plays on first appearance. */
:host(.c-loader--active) {
  opacity: 1;
  visibility: visible;
}

:host(.c-loader--active) .c-loader {
  transform: scale(1);
}

.c-loader {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: scale(0.5);
  transition: transform 0.3s ease-in-out;
}

.c-loader__slot {
  line-height: 40px;
  font-size: 14px;
  color: var(--_c-loader-text-color);
  text-align: center;
  font-weight: 500;
  display: block;
  max-height: 0;
  overflow: hidden;
  animation-duration: 4s;
  animation-direction: forwards;
  animation-iteration-count: 1;
  animation-name: c-loader-fadein;
  animation-fill-mode: forwards;
}

@keyframes c-loader-fadein {
  0% { max-height: 0; }
  100% { max-height: 300px; }
}
</style>
