<template>
  <div :id="hostId || undefined" :class="classes">
    <div ref="containerRef" class="c-swiper-tab__content">
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
        :style="r.style"
        class="c-swiper-tab__ripple"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, useHost, useTemplateRef, watch } from 'vue';

import { useRipple } from '../../shared/useRipple';

interface CSwiperTabProps {
  active?: boolean;
  disabled?: boolean;
  hostId?: string;
  label?: string;
  position?: number;
  setsize?: number;
  value?: number | string;
}

const props = withDefaults(defineProps<CSwiperTabProps>(), {
  active: false,
  disabled: false,
  hostId: '',
  label: '',
  position: undefined,
  setsize: undefined,
  value: undefined,
});

const host = useHost();

const containerRef = useTemplateRef<HTMLElement>('containerRef');

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

// Material-style click ripple (shared logic in useRipple); the
// `.c-swiper-tab__ripple` CSS class carries the transition that tweens it.
const { ripples, spawn: spawnRipple } = useRipple({
  container: () => containerRef.value,
});

onMounted(() => {
  if (!host) return;
  syncHostAttrs();
  host.addEventListener('click', (e) => {
    if (props.active || props.disabled) return;
    spawnRipple(e as MouseEvent);
    host.dispatchEvent(
      new CustomEvent('changeValue', {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: props.value,
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
  --_c-swiper-tab-background-color-active: var(
    --c-swiper-tab-background-color-active,
    var(--c-primary-600)
  );
  --_c-swiper-tab-background-color-disabled: var(
    --c-swiper-tab-background-color-disabled,
    var(--c-tertiary-100)
  );
  --_c-swiper-tab-background-color: var(
    --c-swiper-tab-background-color,
    var(--c-primary-200)
  );
  --_c-swiper-tab-hover-color: var(
    --c-swiper-tab-hover-color,
    var(--c-primary-100)
  );
  --_c-swiper-tab-text-color-active: var(
    --c-swiper-tab-text-color-active,
    var(--c-white)
  );
  --_c-swiper-tab-text-color-disabled: var(
    --c-swiper-tab-text-color-disabled,
    var(--c-tertiary-600)
  );
  --_c-swiper-tab-text-color: var(
    --c-swiper-tab-text-color,
    var(--c-primary-600)
  );

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

.c-swiper-tab:hover:not(.c-swiper-tab--active):not(.c-swiper-tab--disabled)
  .c-swiper-tab__content {
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

/* Scale/opacity are JS-driven (useRipple) and tweened by this transition,
 * matching the shared transition-based ripple primitive (ADR-0004). */
.c-swiper-tab__ripple {
  position: absolute;
  border-radius: 50%;
  background-color: currentColor;
  pointer-events: none;
  transition:
    transform 0.6s ease-out,
    opacity 0.6s ease-out;
}
</style>
