<template>
  <div class="example-row">
    <c-select v-model="vertical" label="Vertical" hide-details>
      <c-option name="Bottom" value="bottom">Bottom</c-option>

      <c-option name="Top" value="top">Top</c-option>
    </c-select>

    <c-select v-model="horizontal" label="Horizontal" hide-details>
      <c-option name="Left" value="left">Left</c-option>

      <c-option name="Center" value="center">Center</c-option>

      <c-option name="Right" value="right">Right</c-option>
    </c-select>

    <c-button @click="notify()">Show toast</c-button>

    <c-toasts ref="toasts" :horizontal="horizontal" :vertical="vertical" />
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';

interface ToastMessage {
  duration?: number;
  message: string;
  persistent?: boolean;
  progress?: boolean;
  title?: string;
  type?: 'error' | 'info' | 'success' | 'warning';
}

type CToastsElement = HTMLElement & {
  addToast: (message: ToastMessage) => void;
};

const toasts = useTemplateRef<CToastsElement>('toasts');

const vertical = ref('bottom');

const horizontal = ref('center');

const notify = () => {
  toasts.value?.addToast({
    type: 'info',
    title: 'Notification',
    message: `Placed at ${vertical.value} ${horizontal.value}.`,
    progress: true,
  });
};
</script>
