<template>
  <div>
    <c-file-upload
      v-model="files"
      :upload
      hint="Earlier uploads are listed; new files upload at once"
      label="Project documents"
      multiple
    />

    <p>Documents: {{ files.map((file) => file.name).join(', ') || 'none' }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CFileUploadEntry, CFileUploadFunction } from '@cscfi/csc-ui';

import { ref } from 'vue';

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

// Files uploaded earlier: no `file`, status `done`, the server's own id.
const serverFiles: CFileUploadEntry[] = [
  {
    id: 'f_12',
    name: 'project-plan.pdf',
    size: 482_113,
    status: 'done',
    type: 'application/pdf',
  },
  {
    id: 'f_13',
    name: 'budget.csv',
    size: 92_400,
    status: 'done',
    type: 'text/csv',
  },
];

const files = ref<CFileUploadEntry[]>(serverFiles);
</script>
