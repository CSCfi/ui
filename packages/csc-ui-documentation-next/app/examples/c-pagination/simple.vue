<template>
  <div>
    <c-pagination v-model="options" hide-details simple />

    <p>Current page: {{ options.currentPage ?? 1 }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { CPaginationOptions } from '@cscfi/csc-ui-next';

const options = ref<CPaginationOptions>({
  itemCount: 40,
  itemsPerPage: 10,
});
</script>
