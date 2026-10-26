<template>
  <div class="example-row">
    <c-button @click="notify('success')">Show success toast</c-button>

    <c-button @click="notify('error')">Show error toast</c-button>

    <c-toasts ref="toasts" />
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue';

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

const notify = (type: 'error' | 'success') => {
  toasts.value?.addToast({
    heading: type === 'success' ? 'Saved' : 'Upload failed',
    message:
      type === 'success'
        ? 'Your changes have been saved.'
        : 'The file could not be uploaded.',
    progress: true,
    type,
  });
};
</script>
