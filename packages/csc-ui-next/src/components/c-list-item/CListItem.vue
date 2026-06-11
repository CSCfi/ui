<template>
  <component
    :is="href ? 'a' : 'div'"
    ref="content"
    class="c-list-item__content"
    :href="href || undefined"
    :target="href ? target : undefined"
  >
    <slot v-if="hasPre" name="pre" />
    <slot />
    <slot v-if="hasPost" name="post" />

    <span v-if="ripple" class="c-list-item__ripples" aria-hidden="true">
      <span
        v-for="r in ripples"
        :key="r.id"
        class="c-list-item__ripple"
        :style="r.style"
      />
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useHost, useTemplateRef, watchEffect } from 'vue';
import { useHasSlot } from '../../shared/useHasSlot';

const props = defineProps({
  active: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  disabledByParent: { type: Boolean, default: false },
  hoverable: { type: Boolean, default: false },
  ripple: { type: Boolean, default: false },
  href: { type: String, default: '' },
  target: { type: String, default: '_blank' },
});

const host = useHost();
const content = useTemplateRef<HTMLElement>('content');
const hasPre = useHasSlot(content, 'pre');
const hasPost = useHasSlot(content, 'post');

const isHoverable = computed(
  () => props.ripple || !!props.href || props.hoverable,
);

// Reflect host-level a11y + state classes/attributes. The Stencil
// version set these on <Host>; here we drive them imperatively since the
// host is the real DOM element.
onMounted(() => {
  if (!host) return;
  host.setAttribute('role', 'listitem');
  watchEffect(() => {
    host.setAttribute('aria-disabled', String(!!props.disabled));
    host.classList.toggle('c-list-item--hoverable', isHoverable.value);
    host.classList.toggle('c-list-item--ripple', props.ripple);
    host.classList.toggle('c-list-item--active', props.active);
    if (props.disabled) host.setAttribute('disabled', 'true');
    else host.removeAttribute('disabled');
    if (props.disabledByParent) host.setAttribute('data-disabled', 'true');
    else host.removeAttribute('data-disabled');

    // tabindex: -1 when disabled, 0 when keyboard-activatable (ripple
    // without a real link), otherwise none.
    if (props.disabled) host.setAttribute('tabindex', '-1');
    else if (props.ripple && !props.href) host.setAttribute('tabindex', '0');
    else host.removeAttribute('tabindex');

    // Propagate active state to a nested c-list-item-title (mirrors the
    // Stencil @Watch('active') handler).
    const title = host.querySelector('c-list-item-title');
    if (title) (title as unknown as { active: boolean }).active = props.active;
  });
});

interface Ripple {
  id: number;
  style: Record<string, string>;
}
const ripples = ref<Ripple[]>([]);
let rippleId = 0;
const RIPPLE_DURATION_MS = 600;

const spawnRipple = (event: MouseEvent, center: boolean) => {
  const target = content.value;
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const isKeyboard =
    center || (event.detail === 0 && event.clientX === 0 && event.clientY === 0);
  const originX = isKeyboard ? rect.left + rect.width / 2 : event.clientX;
  const originY = isKeyboard ? rect.top + rect.height / 2 : event.clientY;
  const x = originX - rect.left - size / 2;
  const y = originY - rect.top - size / 2;
  const id = ++rippleId;
  ripples.value.push({
    id,
    style: { left: `${x}px`, top: `${y}px`, width: `${size}px`, height: `${size}px` },
  });
  setTimeout(() => {
    ripples.value = ripples.value.filter((r) => r.id !== id);
  }, RIPPLE_DURATION_MS);
};

const onClick = (event: MouseEvent, center = false) => {
  if (props.disabled) {
    event.preventDefault();
    return;
  }
  if (!props.ripple) return;
  spawnRipple(event, center);
};

const onKeyup = (event: KeyboardEvent) => {
  if (event.key === ' ' || event.key === 'Enter') {
    onClick(event as unknown as MouseEvent, true);
  }
};

// Listen on the host so clicks anywhere on the item trigger the ripple,
// matching the Stencil @Listen behaviour.
onMounted(() => {
  if (!host) return;
  host.addEventListener('click', onClick as EventListener);
  host.addEventListener('keyup', onKeyup as EventListener);
});
</script>

<style>
:host {
  --_c-list-item-text-color: var(--c-list-item-text-color, var(--c-text-system));
  --_c-list-item-text-color-active: var(--c-list-item-text-color-active, var(--c-primary-600));
  --_c-list-item-background-color: var(--c-list-item-background-color, var(--c-transparent));
  --_c-list-item-background-color-active: var(--c-list-item-background-color-active, rgba(var(--c-primary-rgb), 0.1));
  --_c-list-item-background-color-hover: var(--c-list-item-background-color-hover, rgba(var(--c-primary-rgb), 0.2));
  --_c-list-item-outline-color: var(--c-list-item-outline-color, var(--c-primary-600));
  --_c-list-item-border-radius: 4px;

  display: block;
  background-color: var(--_c-list-item-background-color);
  border-radius: var(--_c-list-item-border-radius);
}

.c-list-item__content {
  align-items: center;
  border-radius: var(--_c-list-item-border-radius);
  color: var(--_c-list-item-text-color);
  display: flex;
  gap: 16px;
  min-height: 42px;
  padding: 12px;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.c-list-item__content slot {
  display: grid;
  gap: 4px;
  line-height: 1.5;
}

.c-list-item__content slot:not([name]) {
  flex: 1;
}

a.c-list-item__content {
  text-decoration: none;
  border-radius: var(--_c-list-item-border-radius);
}

:host(:focus-visible) {
  outline: 2px var(--_c-list-item-outline-color) solid;
  outline-offset: 2px;
}

:host(.c-list-item--hoverable:hover) {
  background-color: var(--_c-list-item-background-color-hover);
}

:host(.c-list-item--active) {
  --_c-list-item-text-color: var(--_c-list-item-text-color-active);

  background-color: var(--_c-list-item-background-color-active);
}

:host(.c-list-item--ripple) {
  cursor: pointer;
}

:host([disabled]) {
  background-color: rgba(var(--c-tertiary-rgb), 0.05);
  cursor: default;
  opacity: 0.75;
  pointer-events: none;
}

:host([disabled]) ::slotted(c-icon) {
  --c-icon-color: var(--c-tertiary-400) !important;
}

.c-list-item__ripples {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  border-radius: inherit;
}

.c-list-item__ripple {
  position: absolute;
  border-radius: 50%;
  background-color: currentColor;
  opacity: 0.15;
  pointer-events: none;
  transform: scale(0);
  animation: c-list-item-ripple 0.6s ease-out forwards;
}

@keyframes c-list-item-ripple {
  to {
    transform: scale(1);
    opacity: 0;
  }
}
</style>
