<template>
  <div>
    <c-file-upload
      v-model="files"
      hint="Any file, any size"
      label="Attachments"
      multiple
    />

    <p>Files: {{ files.map((file) => file.name).join(', ') || 'none' }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CFileUploadEntry } from '@cscfi/csc-ui';

import { ref } from 'vue';

const files = ref<CFileUploadEntry[]>([]);
</script>
