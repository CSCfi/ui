<template>
  <component
    :is="href ? 'a' : 'button'"
    ref="root"
    :id="hostId || undefined"
    :type="href ? undefined : type"
    :disabled="href ? undefined : disabled || undefined"
    :href="href || undefined"
    :target="href ? target : undefined"
    class="c-button__container"
    :class="{ 'rounded-none': noRadius }"
    @click="onClick"
    @keydown="onKeydown"
  >
    <span class="c-button__content">
      <span class="c-button__content__inner" :class="{ 'opacity-0': loading }">
        <slot name="icon" />
        <slot />
      </span>

      <span v-show="hasDescription" class="c-button__content__description">
        <slot name="description" />
      </span>
    </span>

    <span
      v-if="loading"
      class="c-button__loader"
      aria-hidden="true"
    >
      <span
        class="c-button-spinner"
        :style="{ width: `${spinnerSize}px`, height: `${spinnerSize}px` }"
      />
    </span>

    <span class="c-button__ripples" aria-hidden="true">
      <span
        v-for="r in ripples"
        :key="r.id"
        class="c-button__ripple"
        :style="r.style"
      />
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import { useHasSlot } from '../../shared/useHasSlot';

const props = defineProps({
  inverted: { type: Boolean, default: false },
  outlined: { type: Boolean, default: false },
  ghost: { type: Boolean, default: false },
  danger: { type: Boolean, default: false },
  text: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  fit: { type: Boolean, default: false },
  noRadius: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
  size: { type: String, default: 'default' },
  href: { type: String, default: '' },
  target: { type: String, default: '_blank' },
  hostId: { type: String, default: '' },
  value: { type: [String, Number], default: undefined },
});

const root = useTemplateRef<HTMLElement>('root');
const hasDescription = useHasSlot(root, 'description');

const spinnerSize = computed(() => {
  if (props.size === 'small') return 20;
  if (props.size === 'large') return 28;
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
  const target = event.currentTarget as HTMLElement | null;
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  // Keyboard-triggered clicks (Enter / Space on a focused button) fire
  // with detail=0 and clientX/Y=0. Centre the ripple in those cases so it
  // doesn't get positioned off-screen and clipped.
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

const onKeydown = (event: KeyboardEvent) => {
  if (event.code === 'Space' || event.code === 'Enter') {
    if (props.href) {
      window.open(props.href, props.target);
      event.preventDefault();
    }
  }
};
</script>

<style>
/* Ported from packages/csc-ui/src/components/c-button/c-button.scss with
 * class selectors (`:host(.c-button--inverted)`) rewritten as attribute
 * selectors (`:host([inverted])`) — Vue reflects boolean props as
 * presence-attributes, so this is the correct host targeting. Public
 * `--c-button-*` variable names and their fallback values are preserved
 * verbatim for consumer-override compatibility. */

:host {
  --_c-button-border-radius: var(--c-button-border-radius, 4px);
  --_c-button-height: 44px;
  --_c-button-min-width: 88px;
  --_c-button-padding: 0 16px;
  --_c-button-font-size: 16px;
  --_c-button-icon-size: 24px;
  --_c-button-outline-offset: 2px;

  --_c-button-background-color: var(--c-button-background-color, var(--c-primary-600));
  --_c-button-text-color: var(--c-button-text-color, var(--c-white));
  --_c-button-loader-color: var(--c-button-loader-color, var(--_c-button-text-color));
  --_c-button-outline-color: var(--c-button-outline-color, var(--_c-button-background-color));

  border-radius: var(--_c-button-border-radius);
  display: inline-flex;
  height: var(--_c-button-height);
  min-width: max-content;
  transform: translateZ(0);
  transition: background-color 0.3s ease-in-out;
  background-color: var(--_c-button-background-color);
  color: var(--_c-button-text-color);
  font-size: var(--_c-button-font-size);
}

:host(:hover:not([disabled])) {
  --_c-button-background-color-hover: var(--c-button-background-color-hover, var(--c-primary-400));
  background-color: var(--_c-button-background-color-hover);
}

:host([no-radius]) {
  --_c-button-border-radius: 0;
}

:host([fit]),
:host([fitted]) {
  width: 100%;
}

:host([size='small']) {
  --_c-button-height: 28px;
  --_c-button-padding: 0 12px;
  --_c-button-font-size: 14px;
  --_c-button-icon-size: 20px;
}

:host([size='large']) {
  --_c-button-height: 52px;
  --_c-button-padding: 0 24px;
  --_c-button-font-size: 18px;
}

/* ---- inverted ---------------------------------------------------------- */

:host([inverted]) {
  --_c-button-inverted-background-color: var(--c-button-inverted-background-color, var(--c-white));
  --_c-button-inverted-text-color: var(--c-button-inverted-text-color, var(--c-primary-600));
  --_c-button-outline-color: var(--_c-button-inverted-background-color);

  background-color: var(--_c-button-inverted-background-color);
  color: var(--_c-button-inverted-text-color);
}

:host([inverted]:hover:not([disabled])) {
  --_c-button-inverted-background-color-hover: var(--c-button-inverted-background-color-hover, var(--c-primary-200));
  background-color: var(--_c-button-inverted-background-color-hover);
}

:host([inverted][disabled]) {
  --_c-button-inverted-disabled-background-color: var(--c-button-inverted-disabled-background-color, var(--_c-button-disabled-background-color));
  --_c-button-inverted-disabled-text-color: var(--c-button-inverted-disabled-text-color, var(--c-tertiary-500));

  background-color: var(--_c-button-inverted-disabled-background-color);
  color: var(--_c-button-inverted-disabled-text-color);
}

/* ---- danger ------------------------------------------------------------ */

:host([danger]) {
  --_c-button-danger-background-color: var(--c-button-danger-background-color, var(--c-error-600));
  --_c-button-danger-text-color: var(--c-button-danger-text-color, var(--c-white));
  --_c-button-danger-loader-color: var(--c-button-danger-loader-color, var(--_c-button-danger-text-color));
  --_c-button-loader-color: var(--_c-button-danger-loader-color);
  --_c-button-outline-color: var(--_c-button-danger-background-color);

  background-color: var(--_c-button-danger-background-color);
  color: var(--_c-button-danger-text-color);
}

:host([danger]:hover:not([disabled])) {
  --_c-button-danger-background-color-hover: var(--c-button-danger-background-color-hover, var(--c-error-400));
  background-color: var(--_c-button-danger-background-color-hover);
}

:host([danger][disabled]) {
  --_c-button-danger-disabled-background-color: var(--c-button-danger-disabled-background-color, var(--_c-button-disabled-background-color));
  --_c-button-danger-disabled-text-color: var(--c-button-danger-disabled-text-color, var(--_c-button-disabled-text-color));

  background-color: var(--_c-button-danger-disabled-background-color);
  color: var(--_c-button-danger-disabled-text-color);
}

:host([danger][inverted]) {
  --_c-button-danger-inverted-text-color: var(--c-button-danger-inverted-text-color, var(--c-error-600));
  --_c-button-danger-inverted-background-color: var(--c-button-danger-inverted-background-color, var(--c-white));
  --_c-button-outline-color: var(--_c-button-danger-inverted-background-color);

  background-color: var(--_c-button-danger-inverted-background-color);
  color: var(--_c-button-danger-inverted-text-color);
}

:host([danger][inverted]:hover:not([disabled])) {
  --_c-button-danger-inverted-background-color-hover: var(--c-button-danger-inverted-background-color-hover, var(--c-error-100));
  background-color: var(--_c-button-danger-inverted-background-color-hover);
}

:host([danger][inverted][disabled]) {
  --_c-button-danger-inverted-disabled-background-color: var(--c-button-danger-inverted-disabled-background-color, var(--_c-button-disabled-background-color));
  --_c-button-danger-inverted-disabled-text-color: var(--c-button-danger-inverted-disabled-text-color, var(--_c-button-disabled-text-color));

  background-color: var(--_c-button-danger-inverted-disabled-background-color);
  color: var(--_c-button-danger-inverted-disabled-text-color);
}

/* ---- ghost ------------------------------------------------------------- */

:host([ghost]) {
  --_c-button-ghost-background-color: var(--c-button-ghost-background-color, var(--c-primary-200));
  --_c-button-ghost-text-color: var(--c-button-ghost-text-color, var(--c-primary-600));
  --_c-button-ghost-loader-color: var(--c-button-ghost-loader-color, var(--_c-button-ghost-text-color));
  --_c-button-loader-color: var(--_c-button-ghost-loader-color);
  --_c-button-outline-color: var(--_c-button-ghost-text-color);

  background-color: var(--_c-button-ghost-background-color);
  color: var(--_c-button-ghost-text-color);
}

:host([ghost]:hover:not([disabled])) {
  --_c-button-ghost-background-color-hover: var(--c-button-ghost-background-color-hover, var(--c-primary-100));
  background-color: var(--_c-button-ghost-background-color-hover);
}

:host([ghost][disabled]) {
  --_c-button-ghost-disabled-background-color: var(--c-button-ghost-disabled-background-color, var(--_c-button-disabled-background-color));
  --_c-button-ghost-disabled-text-color: var(--c-button-ghost-disabled-text-color, var(--_c-button-disabled-text-color));

  background-color: var(--_c-button-ghost-disabled-background-color);
  color: var(--_c-button-ghost-disabled-text-color);
}

:host([ghost][inverted]) {
  --_c-button-ghost-inverted-background-color: var(--c-button-ghost-inverted-background-color, rgba(var(--c-white-rgb), 0.2));
  --_c-button-ghost-inverted-text-color: var(--c-button-ghost-inverted-text-color, var(--c-white));
  --_c-button-outline-color: var(--_c-button-ghost-inverted-text-color);

  background-color: var(--_c-button-ghost-inverted-background-color);
  color: var(--_c-button-ghost-inverted-text-color);
}

:host([ghost][inverted]:hover:not([disabled])) {
  --_c-button-ghost-inverted-background-color-hover: var(--c-button-ghost-inverted-background-color-hover, rgba(var(--c-white-rgb), 0.3));
  background-color: var(--_c-button-ghost-inverted-background-color-hover);
}

:host([ghost][inverted][disabled]) {
  --_c-button-ghost-inverted-disabled-background-color: var(--c-button-ghost-inverted-disabled-background-color, rgba(var(--c-white-rgb), 0.05));
  --_c-button-ghost-inverted-disabled-text-color: var(--c-button-ghost-inverted-disabled-text-color, var(--c-tertiary-400));

  background-color: var(--_c-button-ghost-inverted-disabled-background-color);
  color: var(--_c-button-ghost-inverted-disabled-text-color);
}

/* ---- text -------------------------------------------------------------- */

:host([text]) {
  --_c-button-text-background-color: var(--c-button-text-background-color, var(--c-transparent));
  --_c-button-text-text-color: var(--c-button-text-text-color, var(--c-primary-600));
  --_c-button-text-loader-color: var(--c-button-text-loader-color, var(--_c-button-text-text-color));
  --_c-button-loader-color: var(--_c-button-text-loader-color);
  --_c-button-outline-color: var(--_c-button-text-text-color);

  background-color: var(--_c-button-text-background-color);
  color: var(--_c-button-text-text-color);
}

:host([text]:hover:not([disabled])) {
  --_c-button-text-background-color-hover: var(--c-button-text-background-color-hover, var(--c-primary-100));
  background-color: var(--_c-button-text-background-color-hover);
}

:host([text][disabled]) {
  --_c-button-text-disabled-background-color: var(--c-button-text-disabled-background-color, var(--c-transparent));
  --_c-button-text-disabled-text-color: var(--c-button-text-disabled-text-color, var(--c-tertiary-400));

  background-color: var(--_c-button-text-disabled-background-color);
  color: var(--_c-button-text-disabled-text-color);
}

:host([text][inverted]) {
  --_c-button-text-inverted-background-color: var(--c-button-text-inverted-background-color, var(--c-transparent));
  --_c-button-text-inverted-text-color: var(--c-button-text-inverted-text-color, var(--c-white));
  --_c-button-outline-color: var(--_c-button-text-inverted-text-color);

  background-color: var(--_c-button-text-inverted-background-color);
  color: var(--_c-button-text-inverted-text-color);
}

:host([text][inverted]:hover:not([disabled])) {
  --_c-button-text-inverted-background-color-hover: var(--c-button-text-inverted-background-color-hover, rgba(var(--c-white-rgb), 0.3));
  background-color: var(--_c-button-text-inverted-background-color-hover);
}

:host([text][inverted][disabled]) {
  --_c-button-text-inverted-disabled-background-color: var(--c-button-text-inverted-disabled-background-color, var(--c-transparent));
  --_c-button-text-inverted-disabled-text-color: var(--c-button-text-inverted-disabled-text-color, var(--c-tertiary-400));

  background-color: var(--_c-button-text-inverted-disabled-background-color);
  color: var(--_c-button-text-inverted-disabled-text-color);
}

/* ---- outlined ---------------------------------------------------------- */

:host([outlined]) {
  --_c-button-outlined-text-color: var(--c-button-outlined-text-color, var(--c-primary-600));
  --_c-button-outlined-border-color: var(--c-button-outlined-border-color, var(--_c-button-outlined-text-color));
  --_c-button-outlined-background-color: var(--c-button-outlined-background-color, var(--c-transparent));
  --_c-button-outlined-loader-color: var(--c-button-outlined-loader-color, var(--_c-button-outlined-text-color));
  --_c-button-loader-color: var(--_c-button-outlined-loader-color);
  --_c-button-outline-color: var(--_c-button-outlined-border-color);

  background-color: var(--_c-button-outlined-background-color);
  color: var(--_c-button-outlined-text-color);
  box-shadow: inset 0 0 0 2px var(--_c-button-outlined-border-color);
}

:host([outlined]:hover:not([disabled])) {
  --_c-button-outlined-background-color-hover: var(--c-button-outlined-background-color-hover, var(--c-primary-200));
  background-color: var(--_c-button-outlined-background-color-hover);
}

:host([outlined][disabled]) {
  --_c-button-outlined-disabled-text-color: var(--c-button-outlined-disabled-text-color, var(--c-tertiary-500));
  --_c-button-outlined-disabled-background-color: var(--c-button-outlined-disabled-background-color, var(--_c-button-outlined-background-color));
  --_c-button-outlined-disabled-border-color: var(--c-button-outlined-disabled-border-color, var(--c-tertiary-400));

  background-color: var(--_c-button-outlined-disabled-background-color);
  color: var(--_c-button-outlined-disabled-text-color);
  box-shadow: inset 0 0 0 2px var(--_c-button-outlined-disabled-border-color);
}

:host([outlined][inverted]) {
  --_c-button-outlined-inverted-text-color: var(--c-button-outlined-inverted-text-color, var(--c-white));
  --_c-button-outlined-inverted-border-color: var(--c-button-outlined-inverted-border-color, var(--_c-button-outlined-inverted-text-color));
  --_c-button-outlined-inverted-background-color: var(--c-button-outlined-inverted-background-color, var(--_c-button-outlined-background-color));
  --_c-button-outline-color: var(--_c-button-outlined-inverted-border-color);

  background-color: var(--_c-button-outlined-inverted-background-color);
  color: var(--_c-button-outlined-inverted-text-color);
  box-shadow: inset 0 0 0 2px var(--_c-button-outlined-inverted-border-color);
}

:host([outlined][inverted]:hover:not([disabled])) {
  --_c-button-outlined-inverted-background-color-hover: var(--c-button-outlined-inverted-background-color-hover, rgba(var(--c-white-rgb), 0.3));
  background-color: var(--_c-button-outlined-inverted-background-color-hover);
}

:host([outlined][inverted][disabled]) {
  --_c-button-outlined-inverted-disabled-border-color: var(--c-button-outlined-inverted-disabled-border-color, var(--c-tertiary-400));
  --_c-button-outlined-inverted-disabled-text-color: var(--c-button-outlined-inverted-disabled-text-color, var(--c-tertiary-400));
  --_c-button-outlined-inverted-disabled-background-color: var(--c-button-outlined-inverted-disabled-background-color, var(--_c-button-outlined-background-color));

  background-color: var(--_c-button-outlined-inverted-disabled-background-color);
  color: var(--_c-button-outlined-inverted-disabled-text-color);
  box-shadow: inset 0 0 0 2px var(--_c-button-outlined-inverted-disabled-border-color);
}

/* ---- disabled (base) --------------------------------------------------- */

:host([disabled]) {
  --_c-button-disabled-background-color: var(--c-button-disabled-background-color, var(--c-tertiary-100));
  --_c-button-disabled-text-color: var(--c-button-disabled-text-color, var(--c-tertiary-600));
  --_c-button-loader-color: var(--_c-button-disabled-text-color);

  background-color: var(--_c-button-disabled-background-color);
  color: var(--_c-button-disabled-text-color);
  cursor: not-allowed;
  pointer-events: none;
}

/* ---- focus / inner -----------------------------------------------------
 * Outline appears only for `:focus-visible` (keyboard navigation / a11y),
 * never for plain `:focus` (mouse clicks). The `:focus { outline: none }`
 * rule kills the browser default; `:focus-visible` re-adds the ring. */

.c-button__container:focus {
  outline: none;
}

.c-button__container:focus-visible {
  outline: 2px solid var(--_c-button-outline-color);
  outline-offset: var(--_c-button-outline-offset);
}

/* Inner structure (not part of the public override surface).
 * Mirrors c-button.scss's `.c-button__content` / `__inner` / `__description`
 * / `__loader` so the padding, font, and slot layout match the original.
 * The `__container` is the actual <button>/<a> element. */

.c-button__container {
  display: inline-grid;
  place-items: center;
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background-color: transparent;
  color: currentColor;
  font: inherit;
  cursor: pointer;
  text-decoration: none;
  border-radius: var(--_c-button-border-radius);
  overflow: hidden;
}

.c-button__container:disabled {
  cursor: not-allowed;
}

.c-button__content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  font-weight: 700;
  user-select: none;
}

.c-button__content__inner {
  display: flex;
  gap: 8px;
  height: var(--_c-button-height);
  align-items: center;
  justify-content: center;
  padding: var(--_c-button-padding);
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.c-button__content__description {
  font-weight: 400;
  font-size: 12px;
  padding: 0 12px 12px;
  text-align: left;
}

::slotted([slot='icon']) {
  font-size: var(--_c-button-icon-size);
}

::slotted(svg) {
  fill: var(--_c-button-loader-color);
}

/* Loading spinner */

.c-button__loader {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  pointer-events: none;
}

.c-button-spinner {
  display: inline-block;
  border: 2px solid var(--_c-button-loader-color);
  border-right-color: transparent;
  border-radius: 50%;
  animation: c-button-spin 0.75s linear infinite;
}

@keyframes c-button-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Material-style ripple. Each click spawns a <span> sized to fit the
 * button's bounding box centred on the click point; the span scales out
 * and fades to zero opacity, then is removed by JS. The container clips
 * with `overflow:hidden` so the ripple respects the button shape. */

.c-button__ripples {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  border-radius: inherit;
}

.c-button__ripple {
  position: absolute;
  border-radius: 50%;
  background-color: currentColor;
  opacity: 0.25;
  pointer-events: none;
  transform: scale(0);
  animation: c-button-ripple 0.6s ease-out forwards;
}

@keyframes c-button-ripple {
  to {
    transform: scale(1);
    opacity: 0;
  }
}
</style>
