<template>
  <div>
    <c-pagination v-model="options" hide-details simple />

    <p>Current page: {{ options.page ?? 1 }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CPaginationOptions } from '@cscfi/csc-ui';

import { ref } from 'vue';

const options = ref<CPaginationOptions>({
  itemCount: 40,
  pageSize: 10,
});
</script>
