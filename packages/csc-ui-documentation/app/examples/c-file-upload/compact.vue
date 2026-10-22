<template>
  <div class="row">
    <c-text-field v-model="name" label="Name" label-on-top />

    <c-file-upload v-model="cv" accept=".pdf" hint="A PDF" label="CV" compact />
  </div>
</template>

<script setup lang="ts">
import type { CFileUploadEntry } from '@cscfi/csc-ui';

import { ref } from 'vue';

const name = ref('');

const cv = ref<CFileUploadEntry[]>([]);
</script>

<style scoped>
.row {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
</style>
