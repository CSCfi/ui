<template>
  <div class="stack">
    <c-file-upload
      ref="field"
      v-model="files"
      :upload="send"
      hint="Files wait until you press Upload"
      label="Attachments"
      manual
      multiple
    />

    <c-button :disabled="!waiting" @click="field?.startUploads()">
      Upload
    </c-button>
  </div>
</template>

<script setup lang="ts">
import type {
  CFileUploadElement,
  CFileUploadEntry,
  CFileUploadFunction,
} from '@cscfi/csc-ui';

import { computed, ref, useTemplateRef } from 'vue';

// Stands in for a real request: reports progress for two seconds, then
// resolves — or refuses a file whose name contains "fail".
const send: CFileUploadFunction = (file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    let sent = 0;

    const timer = setInterval(() => {
      sent = Math.min(1, sent + 0.1);
      onProgress(sent);

      if (sent < 1) return;
      clearInterval(timer);

      if (file.name.includes('fail')) {
        reject(new Error('The server refused the file'));
      } else {
        resolve({ id: `file-${Date.now()}` });
      }
    }, 200);

    signal.addEventListener('abort', () => clearInterval(timer));
  });

const field = useTemplateRef<CFileUploadElement>('field');

const files = ref<CFileUploadEntry[]>([]);

// A `manual` field holds added files as `local` until `startUploads()`.

const waiting = computed(() =>
  files.value.some((file) => file.status === 'local'),
);
</script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
</style>
