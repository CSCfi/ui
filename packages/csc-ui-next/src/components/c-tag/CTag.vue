<template>
  <div class="c-tag__inner" :data-badge="hasBadge ? badge : null">
    <slot />
    <c-icon-button
      v-if="closeable"
      size="x-small"
      :path="closeIcon"
      @click="onClose"
    />
  </div>
</template>

<script setup lang="ts">
import { mdiClose } from '@mdi/js';
import { computed, onMounted, useHost, watchEffect } from 'vue';

const props = defineProps({
  active: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  fit: { type: Boolean, default: false },
  flat: { type: Boolean, default: false },
  closeable: { type: Boolean, default: false },
  badge: { type: [String, Number], default: null },
  size: { type: String, default: 'default' },
});

const closeIcon = mdiClose;
const host = useHost();

const hasBadge = computed(
  () => props.badge !== null && props.badge !== '' && props.badge !== undefined,
);

// Stencil version exposes tabindex + role=button on the host so a tag is
// keyboard-focusable like a button. `flat` tags skip both because they
// are non-interactive labels.
onMounted(() => {
  if (!host) return;
  watchEffect(() => {
    if (props.flat) {
      host.setAttribute('tabindex', '-1');
      host.removeAttribute('role');
    } else {
      host.setAttribute('tabindex', '0');
      host.setAttribute('role', 'button');
    }
  });
});

const onClose = () => {
  host?.dispatchEvent(new CustomEvent('close'));
};
</script>

<style>
:host {
  --_c-tag-background-color-active-hover: var(--c-tag-background-color-active-hover, var(--c-primary-400));
  --_c-tag-background-color-active: var(--c-tag-background-color-active, var(--_c-tag-text-color));
  --_c-tag-background-color-hover: var(--c-tag-background-color-hover, rgba(var(--c-primary-rgb), 0.1));
  --_c-tag-background-color: var(--c-tag-background-color, var(--c-transparent));
  --_c-tag-badge-background-color-active: var(--c-tag-badge-background-color-active, var(--_c-tag-text-color-active));
  --_c-tag-badge-background-color: var(--c-tag-badge-background-color, var(--_c-tag-background-color-active));
  --_c-tag-badge-text-color-active: var(--c-tag-badge-text-color-active, var(--_c-tag-text-color));
  --_c-tag-badge-text-color: var(--c-tag-badge-text-color, var(--_c-tag-text-color-active));
  --_c-tag-border-color: var(--c-tag-border-color, var(--_c-tag-text-color));
  --_c-tag-text-color-active: var(--c-tag-text-color-active, var(--c-white));
  --_c-tag-text-color: var(--c-tag-text-color, var(--c-primary-600));
  --_c-tag-border-radius: var(--c-tag-border-radius, 999px);

  --c-tag-min-height: 28px;
  --c-tag-padding-y: 4px;
  --c-tag-padding-x: 12px;
  --c-tag-padding: var(--c-tag-padding-y) var(--c-tag-padding-x);
  --c-tag-badge-size: 20px;
  --c-tag-icon-button-offset: 0;

  display: inline-flex;
  border-radius: var(--_c-tag-border-radius);
}

.c-tag__inner {
  align-items: center;
  background: var(--_c-tag-background-color);
  border-radius: var(--_c-tag-border-radius);
  box-shadow: inset 0 0 0 1px var(--_c-tag-border-color);
  color: var(--_c-tag-text-color);
  cursor: pointer;
  display: inline-flex;
  font-size: 14px;
  font-weight: 400;
  gap: 8px;
  justify-content: center;
  line-height: 1;
  min-height: var(--c-tag-min-height);
  min-width: 48px;
  padding: var(--c-tag-padding);
  transform: translate3d(0, 0, 0);
  transition: background-color 0.2s ease;
  user-select: none;
}

:host(:hover) .c-tag__inner {
  background-color: var(--_c-tag-background-color-hover);
}

:host(:focus) {
  outline: none;
}

:host(:focus-visible) {
  outline: 2px var(--_c-tag-border-color) solid;
  outline-offset: 2px;
  z-index: 1;
}

:host([active]) {
  --_c-tag-background-color: var(--_c-tag-background-color-active);
  --_c-tag-text-color: var(--_c-tag-text-color-active);
}

:host([active]) .c-tag__inner {
  background: var(--_c-tag-background-color-active);
  color: var(--_c-tag-text-color-active);
}

:host([active]:hover) .c-tag__inner {
  background: var(--_c-tag-background-color-active-hover);
  box-shadow: none;
}

:host([block]) .c-tag__inner {
  flex-basis: 100%;
}

:host([fit]) .c-tag__inner {
  flex-grow: 1;
}

:host([flat]) .c-tag__inner {
  pointer-events: none;
}

:host([closeable]) .c-tag__inner {
  padding-right: var(--c-tag-padding-y);
}

:host([size='small']) {
  --c-tag-min-height: 20px;
  --c-tag-padding-y: 2px;
  --c-tag-padding-x: 8px;
  --c-tag-badge-size: 16px;
  --c-tag-icon-button-offset: 1px 0 0;
}

.c-tag__inner[data-badge] {
  padding-left: var(--c-tag-padding-y);
}

.c-tag__inner[data-badge]::before {
  content: attr(data-badge);
  background-color: var(--_c-tag-badge-background-color);
  border-radius: calc(var(--_c-tag-border-radius) - var(--c-tag-padding-y));
  color: var(--_c-tag-badge-text-color);
  display: inline-grid;
  font-size: 12px;
  height: var(--c-tag-badge-size);
  line-height: 1;
  min-width: var(--c-tag-badge-size);
  padding: 0 4px;
  place-content: center;
}

:host([active]) .c-tag__inner[data-badge]::before {
  background-color: var(--_c-tag-badge-background-color-active);
  color: var(--_c-tag-badge-text-color-active);
}

/* The slotted close button (c-icon-button) needs to inherit the tag's
 * colour palette. Mirror the Stencil rules. */
c-icon-button {
  --_c-icon-button-height: 20px;
  --_c-icon-button-width: 20px;
  --_c-icon-button-background-color: transparent;
  --_c-icon-button-text-color: var(--_c-tag-text-color);
  margin: var(--c-tag-icon-button-offset);
}

:host([size='small']) c-icon-button {
  --_c-icon-button-height: 16px;
  --_c-icon-button-width: 16px;
}

:host([active]) c-icon-button {
  --_c-icon-button-text-color: var(--_c-tag-text-color-active);
}
</style>
