<template>
  <div class="example-row">
    <c-select v-model="position" label="Position" hide-message>
      <c-option name="Top start" value="top-start">Top start</c-option>

      <c-option name="Top" value="top">Top</c-option>

      <c-option name="Top end" value="top-end">Top end</c-option>

      <c-option name="Bottom start" value="bottom-start">Bottom start</c-option>

      <c-option name="Bottom" value="bottom">Bottom</c-option>

      <c-option name="Bottom end" value="bottom-end">Bottom end</c-option>
    </c-select>

    <c-button @click="notify()">Show toast</c-button>

    <c-toasts ref="toasts" :position />
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';

type CToastsElement = {
  addToast: (message: ToastMessage) => void;
} & HTMLElement;

interface ToastMessage {
  duration?: number;
  heading?: string;
  message: string;
  persistent?: boolean;
  progress?: boolean;
  type?: 'error' | 'info' | 'success' | 'warning';
}

const toasts = useTemplateRef<CToastsElement>('toasts');

const position = ref('bottom');

const notify = () => {
  toasts.value?.addToast({
    heading: 'Notification',
    message: `Placed at ${position.value}.`,
    progress: true,
    type: 'info',
  });
};
</script>
