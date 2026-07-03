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
/**
 * @slot default - Description text shown below the tab's label
 * @slot icon - Icon shown next to the label in the tab header
 */
import { computed, onMounted, useHost, useTemplateRef, watch } from 'vue';

import { useHostEmit } from '../../shared/useHostEmit';
import { useRipple } from '../../shared/useRipple';

/** Events dispatched by `<c-swiper-tab>`. */
interface CSwiperTabEvents {
  /**
   * Fired when an inactive, enabled tab is clicked, carrying the tab's value.
   * Bubbles up to the parent `<c-swiper>`, which uses it to select the tab.
   */
  changeValue: number | string | undefined;
}

// The host is the real focusable tab: role/tabindex/aria-* are set on it
// imperatively (syncHostAttrs). Vue's defineCustomElement mirrors non-prop host
// attributes into `$attrs`, which would otherwise fall through onto the shadow
// root `[part=root]` div — a duplicate role/tabindex (second tab stop) and id.
// Keep them on the host only.
defineOptions({ inheritAttrs: false });

interface CSwiperTabProps {
  /**
   * Mark as active
   *
   * @seeded from csc-ui — verify
   */
  active?: boolean;
  /**
   * Disable button
   *
   * @seeded from csc-ui — verify
   */
  disabled?: boolean;
  /**
   * Id of the button
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  hostId?: string;
  /**
   * Label of the button
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  label?: string;
  /**
   * Position in the set
   *
   * @seeded from csc-ui — verify
   */
  position?: number;
  /**
   * Size of the set
   *
   * @seeded from csc-ui — verify
   */
  setsize?: number;
  /**
   * Value of the button
   *
   * @seeded from csc-ui — verify
   */
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

const emit = useHostEmit<CSwiperTabEvents>();

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
    emit('changeValue', props.value, {
      bubbles: true,
      cancelable: true,
      composed: true,
    });
  });
});

watch(
  () => [props.active, props.disabled, props.setsize, props.position],
  syncHostAttrs,
);
</script>

<style>
:host {
  /* Defaults draw from the semantic-token layer (ADR-0010) so the tab strip
   * follows the theme — including dark mode — instead of being pinned to
   * light-mode palette steps. The outer `var(--c-swiper-tab-*, …)` keeps the
   * per-instance consumer override intact. */
  --_c-swiper-tab-background-color-active: var(
    --c-swiper-tab-background-color-active,
    var(--c-primary)
  );
  --_c-swiper-tab-background-color-disabled: var(
    --c-swiper-tab-background-color-disabled,
    var(--c-surface-muted)
  );
  --_c-swiper-tab-background-color: var(
    --c-swiper-tab-background-color,
    var(--c-primary-subtle)
  );
  --_c-swiper-tab-hover-color: var(
    --c-swiper-tab-hover-color,
    var(--c-primary-subtle-hover)
  );
  --_c-swiper-tab-text-color-active: var(
    --c-swiper-tab-text-color-active,
    var(--c-on-primary)
  );
  --_c-swiper-tab-text-color-disabled: var(
    --c-swiper-tab-text-color-disabled,
    var(--c-on-surface-muted)
  );
  --_c-swiper-tab-text-color: var(
    --c-swiper-tab-text-color,
    var(--c-on-primary-subtle)
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
