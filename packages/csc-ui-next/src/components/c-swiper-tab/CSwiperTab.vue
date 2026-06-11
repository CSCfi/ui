<template>
  <div :id="hostId || undefined" :class="classes">
    <div ref="container" class="c-swiper-tab__content">
      <div class="c-swiper-tab__header">
        {{ label }}
        <slot name="icon" />
      </div>

      <div class="c-swiper-tab__description">
        <slot />
      </div>

      <span
        v-for="r in ripples"
        :key="r.id"
        class="c-swiper-tab__ripple"
        :style="r.style"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useHost, useTemplateRef, watch } from 'vue';

const props = defineProps({
  disabled: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  label: { type: String, default: '' },
  hostId: { type: String, default: '' },
  setsize: { type: Number, default: undefined },
  position: { type: Number, default: undefined },
  value: { type: [Number, String], default: undefined },
});

const host = useHost();
const container = useTemplateRef<HTMLElement>('container');

const classes = computed(() => ({
  'c-swiper-tab': true,
  'c-swiper-tab--active': !props.disabled && props.active,
  'c-swiper-tab--disabled': props.disabled,
}));

// Mirror Stencil c-swiper-tab's a11y attributes onto the host.
const syncHostAttrs = () => {
  if (!host) return;
  host.setAttribute('role', 'tab');
  host.setAttribute('aria-selected', props.active ? 'true' : 'false');
  if (props.setsize !== undefined)
    host.setAttribute('aria-setsize', String(props.setsize));
  if (props.position !== undefined)
    host.setAttribute('aria-posinset', String(props.position));
  host.setAttribute('tabindex', props.active ? '0' : '-1');
};

interface Ripple { id: number; style: Record<string, string> }
const ripples = ref<Ripple[]>([]);
let rippleId = 0;
const RIPPLE_DURATION_MS = 600;

const spawnRipple = (event: MouseEvent) => {
  if (!container.value) return;
  const rect = container.value.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  const id = ++rippleId;
  ripples.value.push({
    id,
    style: {
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
    },
  });
  setTimeout(() => {
    ripples.value = ripples.value.filter((r) => r.id !== id);
  }, RIPPLE_DURATION_MS);
};

onMounted(() => {
  if (!host) return;
  syncHostAttrs();
  host.addEventListener('click', (e) => {
    if (props.active || props.disabled) return;
    spawnRipple(e as MouseEvent);
    host.dispatchEvent(
      new CustomEvent('changeValue', {
        detail: props.value,
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
  });
});

watch(
  () => [props.active, props.disabled, props.setsize, props.position],
  syncHostAttrs,
);
</script>

<style>
:host {
  --_c-swiper-tab-background-color-active: var(--c-swiper-tab-background-color-active, var(--c-primary-600));
  --_c-swiper-tab-background-color-disabled: var(--c-swiper-tab-background-color-disabled, var(--c-tertiary-100));
  --_c-swiper-tab-background-color: var(--c-swiper-tab-background-color, var(--c-primary-200));
  --_c-swiper-tab-hover-color: var(--c-swiper-tab-hover-color, var(--c-primary-100));
  --_c-swiper-tab-text-color-active: var(--c-swiper-tab-text-color-active, var(--c-white));
  --_c-swiper-tab-text-color-disabled: var(--c-swiper-tab-text-color-disabled, var(--c-tertiary-600));
  --_c-swiper-tab-text-color: var(--c-swiper-tab-text-color, var(--c-primary-600));

  border-radius: 8px;
  width: 100%;
  height: 100%;
  outline: none;
  text-decoration: none;
  user-select: none;
  display: grid;
  align-content: stretch;
  padding: 4px;
  background-color: transparent;
  border: none;
}

:host(:focus-visible) {
  outline: 2px var(--_c-swiper-tab-background-color-active) solid;
  outline-offset: -2px;
}

.c-swiper-tab {
  height: 100%;
}

.c-swiper-tab:hover:not(.c-swiper-tab--active):not(.c-swiper-tab--disabled) .c-swiper-tab__content {
  background-color: var(--_c-swiper-tab-hover-color);
}

.c-swiper-tab__content {
  border-radius: 6px;
  background-color: var(--_c-swiper-tab-background-color);
  color: var(--_c-swiper-tab-text-color);
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  display: grid;
  gap: 4px;
  grid-template-columns: 1fr;
  line-height: 1.5;
  padding: 16px;
  align-content: start;
  position: relative;
  overflow: hidden;
  height: 100%;
}

.c-swiper-tab__header {
  line-height: 38px;
  font-size: 24px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
}

.c-swiper-tab__description {
  align-items: start;
  opacity: 0.67;
}

.c-swiper-tab--disabled .c-swiper-tab__content {
  background: var(--_c-swiper-tab-background-color-disabled);
  color: var(--_c-swiper-tab-text-color-disabled);
  cursor: default !important;
  pointer-events: none;
}

.c-swiper-tab--active .c-swiper-tab__content {
  background-color: var(--_c-swiper-tab-background-color-active);
  color: var(--_c-swiper-tab-text-color-active);
  pointer-events: none;
}

.c-swiper-tab--active .c-swiper-tab__content:hover {
  background-color: var(--_c-swiper-tab-background-color-active);
}

::slotted(svg),
.c-swiper-tab svg {
  fill: currentColor;
  height: 38px;
  width: 38px;
}

.c-swiper-tab__ripple {
  position: absolute;
  border-radius: 50%;
  background-color: currentColor;
  opacity: 0.25;
  pointer-events: none;
  transform: scale(0);
  animation: c-swiper-tab-ripple 0.6s ease-out forwards;
}

@keyframes c-swiper-tab-ripple {
  to { transform: scale(1); opacity: 0; }
}
</style>
