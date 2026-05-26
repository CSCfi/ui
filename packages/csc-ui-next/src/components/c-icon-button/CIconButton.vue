<template>
  <button
    :disabled="disabled"
    class="c-icon-button__button"
    @click="onClick"
  >
    <div ref="container" class="c-icon-button__inner">
      <span
        v-if="loading"
        class="c-icon-button__spinner"
        :style="{ width: `${spinnerSize}px`, height: `${spinnerSize}px` }"
      />
      <template v-else>
        <slot>
          <svg v-if="path" width="24" height="24" viewBox="0 0 24 24">
            <path :d="path" fill="currentColor" />
          </svg>
        </slot>
      </template>
    </div>

    <span v-if="badge !== null && badge !== ''" class="c-icon-button__badge">
      {{ badge }}
    </span>

    <span class="c-icon-button__ripples" aria-hidden="true">
      <span
        v-for="r in ripples"
        :key="r.id"
        class="c-icon-button__ripple"
        :style="r.style"
      />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';

const props = defineProps({
  badge: { type: [String, Number], default: null },
  danger: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  text: { type: Boolean, default: false },
  inverted: { type: Boolean, default: false },
  outlined: { type: Boolean, default: false },
  ghost: { type: Boolean, default: false },
  path: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: 'default' },
});

const container = useTemplateRef<HTMLElement>('container');

const spinnerSize = computed(() => {
  if (props.size === 'x-small') return 18;
  if (props.size === 'small') return 20;
  return 24;
});

interface Ripple {
  id: number;
  style: Record<string, string>;
}
const ripples = ref<Ripple[]>([]);
let rippleId = 0;
const RIPPLE_DURATION_MS = 600;

const spawnRipple = (event: MouseEvent) => {
  const target = container.value;
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const isKeyboardActivation =
    event.detail === 0 && event.clientX === 0 && event.clientY === 0;
  const originX = isKeyboardActivation
    ? rect.left + rect.width / 2
    : event.clientX;
  const originY = isKeyboardActivation
    ? rect.top + rect.height / 2
    : event.clientY;
  const x = originX - rect.left - size / 2;
  const y = originY - rect.top - size / 2;
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

const onClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  spawnRipple(event);
};
</script>

<style>
/* Ported from packages/csc-ui/src/components/c-icon-button/c-icon-button.scss.
 * Variant logic via attribute selectors on :host (matches c-button pattern).
 * Inlines a minimal badge visual instead of pulling in <c-badge>. */

:host {
  --_c-icon-button-background-color: var(--c-icon-button-background-color, var(--c-primary-600));
  --_c-icon-button-background-color-hover: var(--c-icon-button-background-color-hover, var(--c-primary-400));
  --_c-icon-button-badge-background-color: var(--c-icon-button-badge-background-color, var(--c-warning-600));
  --_c-icon-button-badge-border-color: var(--c-icon-button-badge-border-color, var(--c-white));
  --_c-icon-button-badge-text-color: var(--c-icon-button-badge-text-color, var(--c-white));
  --_c-icon-button-border-radius: var(--c-icon-button-border-radius, 50%);
  --_c-icon-button-outline-color: var(--c-icon-button-outline-color, var(--c-primary-600));
  --_c-icon-button-outline-offset: var(--c-icon-button-outline-offset, 2px);
  --_c-icon-button-text-color: var(--c-icon-button-text-color, var(--c-white));
  --_c-icon-button-height: 40px;
  --_c-icon-button-width: 40px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: var(--_c-icon-button-width);
  height: var(--_c-icon-button-height);
  background-color: var(--_c-icon-button-background-color);
  color: var(--_c-icon-button-text-color);
  border-radius: var(--_c-icon-button-border-radius);
  transition: background-color 0.3s ease;
  line-height: normal;
  font-family: var(--c-font-family);
}

:host(:hover:not([disabled])) {
  background-color: var(--_c-icon-button-background-color-hover);
}

:host([size='small']) {
  --_c-icon-button-height: 32px;
  --_c-icon-button-width: 32px;
}

:host([size='x-small']) {
  --_c-icon-button-height: 28px;
  --_c-icon-button-width: 28px;
}

/* ---- inverted ---------------------------------------------------------- */

:host([inverted]) {
  --_c-icon-button-inverted-background-color: var(--c-icon-button-inverted-background-color, var(--c-white));
  --_c-icon-button-inverted-text-color: var(--c-icon-button-inverted-text-color, var(--c-primary-600));
  --_c-icon-button-inverted-background-color-hover: var(--c-icon-button-inverted-background-color-hover, var(--c-primary-200));

  background-color: var(--_c-icon-button-inverted-background-color);
  color: var(--_c-icon-button-inverted-text-color);
}

:host([inverted]:hover:not([disabled])) {
  background-color: var(--_c-icon-button-inverted-background-color-hover);
}

/* ---- danger ------------------------------------------------------------ */

:host([danger]) {
  --_c-icon-button-danger-background-color: var(--c-icon-button-danger-background-color, var(--c-error-600));
  --_c-icon-button-danger-text-color: var(--c-icon-button-danger-text-color, var(--c-white));
  --_c-icon-button-danger-background-color-hover: var(--c-icon-button-danger-background-color-hover, var(--c-error-400));

  background-color: var(--_c-icon-button-danger-background-color);
  color: var(--_c-icon-button-danger-text-color);
}

:host([danger]:hover:not([disabled])) {
  background-color: var(--_c-icon-button-danger-background-color-hover);
}

/* ---- ghost ------------------------------------------------------------- */

:host([ghost]) {
  --_c-icon-button-ghost-background-color: var(--c-icon-button-ghost-background-color, rgba(var(--c-primary-rgb), 0.2));
  --_c-icon-button-ghost-text-color: var(--c-icon-button-ghost-text-color, var(--c-primary-600));
  --_c-icon-button-ghost-background-color-hover: var(--c-icon-button-ghost-background-color-hover, rgba(var(--c-primary-rgb), 0.3));

  background-color: var(--_c-icon-button-ghost-background-color);
  color: var(--_c-icon-button-ghost-text-color);
}

:host([ghost]:hover:not([disabled])) {
  background-color: var(--_c-icon-button-ghost-background-color-hover);
}

:host([ghost][inverted]) {
  --_c-icon-button-ghost-inverted-background-color: var(--c-icon-button-ghost-inverted-background-color, rgba(var(--c-white-rgb), 0.2));
  --_c-icon-button-ghost-inverted-text-color: var(--c-icon-button-ghost-inverted-text-color, var(--c-white));
  --_c-icon-button-ghost-inverted-background-color-hover: var(--c-icon-button-ghost-inverted-background-color-hover, rgba(var(--c-white-rgb), 0.3));

  background-color: var(--_c-icon-button-ghost-inverted-background-color);
  color: var(--_c-icon-button-ghost-inverted-text-color);
}

:host([ghost][inverted]:hover:not([disabled])) {
  background-color: var(--_c-icon-button-ghost-inverted-background-color-hover);
}

/* ---- text -------------------------------------------------------------- */

:host([text]) {
  --_c-icon-button-text-text-color: var(--c-icon-button-text-text-color, var(--c-primary-600));
  --_c-icon-button-text-background-color: var(--c-icon-button-text-background-color, var(--c-transparent));
  --_c-icon-button-text-background-color-hover: var(--c-icon-button-text-background-color-hover, var(--c-primary-100));

  background-color: var(--_c-icon-button-text-background-color);
  color: var(--_c-icon-button-text-text-color);
}

:host([text]:hover:not([disabled])) {
  background-color: var(--_c-icon-button-text-background-color-hover);
}

:host([text][inverted]) {
  --_c-icon-button-text-inverted-text-color: var(--c-icon-button-text-inverted-text-color, var(--c-white));
  --_c-icon-button-text-inverted-background-color: var(--c-icon-button-text-inverted-background-color, var(--c-transparent));
  --_c-icon-button-text-inverted-background-color-hover: var(--c-icon-button-text-inverted-background-color-hover, rgba(var(--c-white-rgb), 0.2));

  background-color: var(--_c-icon-button-text-inverted-background-color);
  color: var(--_c-icon-button-text-inverted-text-color);
}

:host([text][inverted]:hover:not([disabled])) {
  background-color: var(--_c-icon-button-text-inverted-background-color-hover);
}

/* ---- outlined ---------------------------------------------------------- */

:host([outlined]) {
  --_c-icon-button-outlined-text-color: var(--c-icon-button-outlined-text-color, var(--c-primary-600));
  --_c-icon-button-outlined-background-color: var(--c-icon-button-outlined-background-color, var(--c-transparent));
  --_c-icon-button-outlined-background-color-hover: var(--c-icon-button-outlined-background-color-hover, rgba(var(--c-primary-rgb), 0.1));
  --_c-icon-button-outlined-border-color: var(--c-icon-button-outlined-border-color, var(--_c-icon-button-outlined-text-color));

  background-color: var(--_c-icon-button-outlined-background-color);
  color: var(--_c-icon-button-outlined-text-color);
  box-shadow: inset 0 0 0 2px var(--_c-icon-button-outlined-border-color);
}

:host([outlined]:hover:not([disabled])) {
  background-color: var(--_c-icon-button-outlined-background-color-hover);
}

:host([outlined][inverted]) {
  --_c-icon-button-outlined-inverted-text-color: var(--c-icon-button-outlined-inverted-text-color, var(--c-white));
  --_c-icon-button-outlined-inverted-background-color: var(--c-icon-button-outlined-inverted-background-color, var(--c-transparent));
  --_c-icon-button-outlined-inverted-background-color-hover: var(--c-icon-button-outlined-inverted-background-color-hover, rgba(var(--c-white-rgb), 0.2));
  --_c-icon-button-outlined-inverted-border-color: var(--c-icon-button-outlined-inverted-border-color, var(--_c-icon-button-outlined-inverted-text-color));

  background-color: var(--_c-icon-button-outlined-inverted-background-color);
  color: var(--_c-icon-button-outlined-inverted-text-color);
  box-shadow: inset 0 0 0 2px var(--_c-icon-button-outlined-inverted-border-color);
}

:host([outlined][inverted]:hover:not([disabled])) {
  background-color: var(--_c-icon-button-outlined-inverted-background-color-hover);
}

/* ---- disabled ---------------------------------------------------------- */

:host([disabled]) {
  --_c-icon-button-background-color-disabled: var(--c-icon-button-background-color-disabled, var(--c-tertiary-100));
  --_c-icon-button-text-color-disabled: var(--c-icon-button-text-color-disabled, var(--c-tertiary-600));

  background-color: var(--_c-icon-button-background-color-disabled);
  color: var(--_c-icon-button-text-color-disabled);
  pointer-events: none;
}

:host([outlined][disabled]) {
  box-shadow: inset 0 0 0 2px var(--c-tertiary-400);
}

/* ---- internals --------------------------------------------------------- */

.c-icon-button__button {
  appearance: none;
  background-color: transparent;
  color: currentColor;
  display: inline-grid;
  place-items: center;
  border: none;
  padding: 0;
  margin: 0;
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  transition:
    background-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1),
    color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  outline: none;
  border-radius: var(--_c-icon-button-border-radius);
  /* `overflow: hidden` is intentionally NOT set here — it would clip
   * the badge that overhangs the button's top-right corner. The ripple
   * has its own clipped container (.c-icon-button__ripples) that
   * respects the border-radius, so we don't need overflow on the
   * button itself. */
}

.c-icon-button__button:disabled {
  cursor: default;
}

.c-icon-button__button:focus {
  outline: none;
}

.c-icon-button__button:focus-visible {
  outline: 2px var(--_c-icon-button-outline-color) solid;
  outline-offset: var(--_c-icon-button-outline-offset);
}

.c-icon-button__inner {
  align-items: center;
  display: flex;
  height: 100%;
  inset: 0;
  justify-content: center;
  overflow: hidden;
  position: relative;
  transform: translateZ(0);
  width: 100%;
}

::slotted(c-icon) {
  --_c-icon-size: 24px;
}

::slotted(svg),
::slotted(i),
::slotted(span) {
  width: 24px;
  height: 24px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:host([size='small']) ::slotted(c-icon) { --_c-icon-size: 20px; }
:host([size='small']) ::slotted(svg),
:host([size='small']) ::slotted(i),
:host([size='small']) ::slotted(span) {
  width: 22px;
  height: 22px;
  font-size: 16px;
}

:host([size='x-small']) ::slotted(c-icon) { --_c-icon-size: 14px; }
:host([size='x-small']) ::slotted(svg),
:host([size='x-small']) ::slotted(i),
:host([size='x-small']) ::slotted(span) {
  width: 18px;
  height: 18px;
  font-size: 14px;
}

::slotted(*),
svg {
  pointer-events: none;
}

/* Badge (inlined — original uses <c-badge>). 18px circular pill with
 * 2px border for separation from the button bg. Sits top-right. */
.c-icon-button__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  background-color: var(--_c-icon-button-badge-background-color);
  color: var(--_c-icon-button-badge-text-color);
  border: 2px solid var(--_c-icon-button-badge-border-color);
  font-size: 11px;
  line-height: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
}

/* Loading spinner. Reuses the c-button pattern: bordered circle with
 * one transparent edge. */
.c-icon-button__spinner {
  display: inline-block;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: c-icon-button-spin 0.75s linear infinite;
}

@keyframes c-icon-button-spin {
  to { transform: rotate(360deg); }
}

/* Material-style ripple — same pattern as c-button. */
.c-icon-button__ripples {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  border-radius: inherit;
}

.c-icon-button__ripple {
  position: absolute;
  border-radius: 50%;
  background-color: currentColor;
  opacity: 0.25;
  pointer-events: none;
  transform: scale(0);
  animation: c-icon-button-ripple 0.6s ease-out forwards;
}

@keyframes c-icon-button-ripple {
  to {
    transform: scale(1);
    opacity: 0;
  }
}
</style>
