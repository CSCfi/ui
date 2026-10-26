<template>
  <div>
    <c-pagination v-model="options" />

    <p>Current page: {{ options.page ?? 1 }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CPaginationOptions } from '@cscfi/csc-ui';

import { ref } from 'vue';

const options = ref<CPaginationOptions>({
  itemCount: 96,
  pageSize: 10,
  pageSizes: [10, 25, 50],
});
</script>
