<template>
  <div ref="ripple" class="c-ripple" />
</template>

<script setup lang="ts">
import { onMounted, useHost, useTemplateRef } from 'vue';

const host = useHost();
const ripple = useTemplateRef<HTMLElement>('ripple');

// Public method, called imperatively by parents (e.g.
// `element.createRipple(event, container)` from Stencil c-button etc.).
// Expose it on the host so the existing call sites keep working without
// caring whether the element is a Stencil or Vue implementation.
const calculateHeight = (size: number) => Math.sqrt(2) * size;

const createRipple = (event: MouseEvent, parent: HTMLElement, center = false) => {
  const el = ripple.value;
  if (!el || !host) return;
  el.classList.remove('animate');

  const width = parent.offsetWidth;
  const height = parent.offsetHeight;
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  const maxDimension = calculateHeight(Math.max(width, height));
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const top = `${y - maxDimension / 2}px`;
  const left = `${x - maxDimension / 2}px`;
  const centerPosition = {
    top:
      maxDimension === height
        ? '0px'
        : `${((maxDimension - height) / 2) * -1}px`,
    left:
      maxDimension === width
        ? '0px'
        : `${((maxDimension - width) / 2) * -1}px`,
  };

  host.style.width = `${width}px`;
  host.style.height = `${height}px`;
  el.style.width = `${maxDimension}px`;
  el.style.height = `${maxDimension}px`;
  el.style.top = center ? centerPosition.top : top;
  el.style.left = center ? centerPosition.left : left;
  el.classList.add('animate');
  setTimeout(() => el.classList.remove('animate'), 500);
};

onMounted(() => {
  if (!host) return;
  host.setAttribute('aria-hidden', 'true');
  (host as unknown as { createRipple: typeof createRipple }).createRipple =
    createRipple;
});
</script>

<style>
:host {
  pointer-events: none;
  user-select: none;
  display: block;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: inherit;
  z-index: 1;
}

.c-ripple {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  transform: scale(0);
  background: currentColor;
  opacity: 0;
}

.c-ripple.animate {
  animation: c-ripple 0.5s backwards linear;
  opacity: 0.3;
}

@keyframes c-ripple {
  100% {
    opacity: 0;
    transform: scale(5);
  }
}
</style>
