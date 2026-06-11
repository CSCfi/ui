<template>
  <div
    class="c-backdrop"
    :class="{ 'c-backdrop--blur': !disableBackdropBlur }"
  />
</template>

<script setup lang="ts">
defineProps({
  disableBackdropBlur: { type: Boolean, default: false },
});
</script>

<style>
.c-backdrop {
  display: block;
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  pointer-events: none;
}

.c-backdrop.c-backdrop--blur {
  backdrop-filter: blur(4px);
}

/* The opening / closing classes are toggled imperatively by c-modal
 * via the backdrop's shadow root — fade-in / fade-out animations. */
@media (prefers-reduced-motion: no-preference) {
  .c-backdrop.opening {
    animation: c-backdrop-fadein 0.3s cubic-bezier(0.25, 0.8, 0.5, 1) forwards;
  }
  .c-backdrop.closing {
    animation: c-backdrop-fadeout 0.3s cubic-bezier(0.25, 0.8, 0.5, 1) forwards;
  }
}

@keyframes c-backdrop-fadein {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes c-backdrop-fadeout {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
