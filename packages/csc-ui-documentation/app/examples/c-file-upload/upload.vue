<template>
  <div>
    <c-file-upload
      v-model="files"
      :upload
      hint="A file named “fail…” is refused"
      label="Datasets"
      multiple
    />

    <p>Uploaded: {{ done }} of {{ files.length }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CFileUploadEntry, CFileUploadFunction } from '@cscfi/csc-ui';

import { computed, ref } from 'vue';

// Stands in for a real request: reports progress for two seconds, then
// resolves — or refuses a file whose name contains "fail".
const upload: CFileUploadFunction = (file, { onProgress, signal }) =>
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

const files = ref<CFileUploadEntry[]>([]);

const done = computed(
  () => files.value.filter((file) => file.status === 'done').length,
);
</script>
