<template>
  <div>
    <c-file-upload
      v-model="files"
      accept=".pdf,image/*"
      hint="PDF or images, up to 10 MB each, at most 3"
      label="Receipts"
      max-files="3"
      max-size="10000000"
      multiple
      @change="refused = ''"
      @reject="refused = describe($event.detail)"
    />

    <p>Refused: {{ refused || 'none' }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CFileUploadEntry, CFileUploadRejection } from '@cscfi/csc-ui';

import { ref } from 'vue';

const files = ref<CFileUploadEntry[]>([]);

// The latest add's refusals, cleared by the next change to the list — the
// `reject` event follows the `change` of the same add.
const refused = ref('');

const describe = (rejections: CFileUploadRejection[]): string =>
  rejections.map(({ file, reason }) => `${file.name} (${reason})`).join(', ');
</script>
