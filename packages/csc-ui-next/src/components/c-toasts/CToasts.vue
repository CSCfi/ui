<template>
  <div ref="containerRef">
    <c-toast
      v-for="msg in messages"
      :key="msg.id"
      ref="toastRefs"
      :message="msg"
      @close="onChildClose"
    >
      <slot v-if="msg.custom" />
    </c-toast>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, useHost, useTemplateRef, watchEffect } from 'vue';

interface ToastMessage {
  message: string;
  title?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  duration?: number;
  persistent?: boolean;
  id?: string;
  closeText?: string;
  indeterminate?: boolean;
  progress?: boolean;
  custom?: boolean;
}

const props = defineProps({
  absolute: { type: Boolean, default: false },
  horizontal: { type: String, default: 'center' },
  vertical: { type: String, default: 'bottom' },
});

const host = useHost();
const containerRef = useTemplateRef<HTMLElement>('containerRef');
const messages = ref<ToastMessage[]>([]);

let nextId = 0;
const defaultOptions = () => ({
  type: 'info' as const,
  duration: 6000,
  persistent: false,
  indeterminate: false,
  progress: false,
  id: `c-toast-item-${++nextId}`,
});

// Public method: append a new toast. Custom toasts are limited to 1 at
// a time because slot reflection can only project to one place.
const addToast = (message: ToastMessage) => {
  const hasCustom = messages.value.some((m) => m.custom);
  if (message.custom && hasCustom) {
    console.warn(
      'Custom toast messages are restricted to 1 visible message due to slot reflection limitations.',
    );
    return;
  }
  requestAnimationFrame(() => {
    const defaults = defaultOptions();
    messages.value = [
      ...messages.value,
      {
        ...defaults,
        ...message,
        duration:
          Number(message?.duration) > 0
            ? Number(message.duration)
            : defaults.duration,
      },
    ];
  });
};

// Public method: imperatively close a toast by id. Reaches into the
// rendered c-toast's exposed `closeToast` method (set via defineExpose
// in CToast.vue).
const removeToast = (id: string) => {
  const toast = containerRef.value?.querySelector(
    `#c-toast--${id}`,
  ) as (HTMLElement & { closeToast?: () => void }) | null;
  toast?.closeToast?.();
};

const onChildClose = (event: CustomEvent<ToastMessage>) => {
  const id = event.detail?.id;
  if (!id) return;
  const toast = containerRef.value?.querySelector(`#c-toast--${id}`);
  toast?.remove();
  const remaining = containerRef.value?.querySelectorAll('c-toast').length || 0;
  if (remaining === 0) {
    messages.value = [];
  }
};

defineExpose({ addToast, removeToast });

onMounted(() => {
  if (!host) return;
  watchEffect(() => {
    host.classList.toggle('absolute', props.absolute);
    host.classList.toggle('top', props.vertical === 'top');
    host.classList.toggle('bottom', props.vertical === 'bottom');
    host.classList.toggle('left', props.horizontal === 'left');
    host.classList.toggle('right', props.horizontal === 'right');
    host.classList.toggle('center', props.horizontal === 'center');
  });
});
</script>

<style>
:host {
  left: 0;
  max-width: 100%;
  min-width: 30vw;
  pointer-events: none;
  position: fixed;
  right: 0;
  width: 640px;
  z-index: 10000;
}

:host > div {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
  padding: 12px;
}

:host(.absolute) { position: absolute; }
:host(.bottom) { bottom: 0; }
:host(.top) { top: 0; }
:host(.right) {
  justify-content: end;
  left: auto;
  right: 0;
}
:host(.left) {
  justify-content: start;
  left: 0;
  right: auto;
}
:host(.center) {
  justify-content: center;
  margin: 0 auto !important;
}
</style>
