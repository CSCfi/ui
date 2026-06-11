<template>
  <div ref="content" class="c-tab__content">
    <slot />

    <span class="c-tab__ripples" aria-hidden="true">
      <span
        v-for="r in ripples"
        :key="r.id"
        class="c-tab__ripple"
        :style="r.style"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, useHost, useTemplateRef, watchEffect } from 'vue';

const props = defineProps({
  active: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  hostId: { type: String, default: '' },
  position: { type: Number, default: undefined },
  setsize: { type: Number, default: undefined },
  value: { type: [Number, String], default: undefined },
});

const host = useHost();
const content = useTemplateRef<HTMLElement>('content');

const emit = (name: string, detail: unknown) => {
  host?.dispatchEvent(
    new CustomEvent(name, { detail, bubbles: true, composed: true }),
  );
};

// Reflect tab state + a11y onto the host (the real tab element c-tabs
// queries and wires aria-controls/posinset onto).
onMounted(() => {
  if (!host) return;
  host.setAttribute('role', 'tab');
  watchEffect(() => {
    host.classList.toggle('c-tab', true);
    host.classList.toggle('c-tab--active', props.active);
    host.classList.toggle('c-tab--disabled', props.disabled);
    host.setAttribute('aria-disabled', String(props.disabled));
    host.setAttribute('aria-hidden', String(props.disabled));
    host.setAttribute('aria-selected', String(props.active));
    if (props.setsize != null) host.setAttribute('aria-setsize', String(props.setsize));
    if (props.position != null) host.setAttribute('aria-posinset', String(props.position));
    if (props.hostId) host.setAttribute('id', props.hostId);
    if (props.value != null) host.setAttribute('data-value', String(props.value));
    host.setAttribute('tabindex', props.active && !props.disabled ? '0' : '-1');
  });

  host.addEventListener('click', (e) => onClick(e as MouseEvent));
  host.addEventListener('focus', () => emit('tabFocus', props.value));
  host.addEventListener('keydown', (e) => {
    const ke = e as KeyboardEvent;
    if (ke.code === 'Space' || ke.code === 'Enter') {
      ke.preventDefault();
      onClick(ke as unknown as MouseEvent, true);
    }
  });
});

interface Ripple {
  id: number;
  style: Record<string, string>;
}
const ripples = ref<Ripple[]>([]);
let rippleId = 0;

const spawnRipple = (event: MouseEvent, center: boolean) => {
  const target = host;
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const isKeyboard =
    center || (event.detail === 0 && event.clientX === 0 && event.clientY === 0);
  const originX = isKeyboard ? rect.left + rect.width / 2 : event.clientX;
  const originY = isKeyboard ? rect.top + rect.height / 2 : event.clientY;
  const id = ++rippleId;
  ripples.value.push({
    id,
    style: {
      left: `${originX - rect.left - size / 2}px`,
      top: `${originY - rect.top - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
    },
  });
  setTimeout(() => {
    ripples.value = ripples.value.filter((r) => r.id !== id);
  }, 600);
};

const onClick = (event: MouseEvent, center = false) => {
  if (props.disabled) return;
  spawnRipple(event, center);
  emit('tabChange', { value: props.value, element: host });
};
</script>

<style>
:host {
  --_c-tab-border-color-active: var(--c-tab-border-color-active, var(--_c-tab-text-color));
  --_c-tab-background-color-hover: var(--c-tab-background-color-hover, var(--c-primary-100));
  --_c-tab-outline-color: var(--c-tab-outline-color, var(--_c-tab-text-color));
  --_c-tab-text-color: var(--c-tab-text-color, var(--c-primary-600));

  display: block;
  user-select: none;
  min-width: min-content;
  flex-grow: 1;
}

.c-tab__content {
  align-items: center;
  justify-content: center;
  display: flex;
  height: 100%;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  padding-inline: 12px;
  position: relative;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:host(:focus) {
  outline: none;
}

:host(:focus-visible) {
  border-radius: 4px;
  outline: 2px var(--_c-tab-outline-color) solid;
  outline-offset: 2px;
}

:host([aria-disabled='true']) {
  cursor: default !important;
}

slot {
  pointer-events: none;
}

:host(.c-tab) {
  align-items: center;
  color: var(--_c-tab-text-color);
  cursor: pointer;
  display: inline-flex;
  font-weight: 600;
  height: 52px;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

:host(.c-tab:hover) {
  background-color: var(--_c-tab-background-color-hover);
}

:host(.c-tab--active:hover) {
  background-color: transparent !important;
}

:host(.c-tab--disabled) {
  color: var(--c-tertiary-500);
  cursor: default;
  opacity: 0.75;
  pointer-events: none;
}

.c-tab__ripples {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.c-tab__ripple {
  position: absolute;
  border-radius: 50%;
  background-color: currentColor;
  opacity: 0.2;
  pointer-events: none;
  transform: scale(0);
  animation: c-tab-ripple 0.6s ease-out forwards;
}

@keyframes c-tab-ripple {
  to {
    transform: scale(1);
    opacity: 0;
  }
}
</style>
