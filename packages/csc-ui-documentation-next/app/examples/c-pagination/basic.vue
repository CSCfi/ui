<template>
  <div>
    <c-pagination :value.prop="options" @changeValue="onChange" />

    <p>Current page: {{ page }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CPaginationOptions } from '@cscfi/csc-ui-next';

const options = ref<CPaginationOptions>({
  itemCount: 96,
  itemsPerPage: 10,
  pageSizes: [10, 25, 50],
});

const page = ref(1);

const onChange = (event: Event) => {
  page.value =
    (event as CustomEvent<CPaginationOptions>).detail.currentPage ?? 1;
};
</script>
