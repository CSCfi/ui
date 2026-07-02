<template>
  <div>
    <c-pagination :value.prop="options" @changeValue="onChange" />

    <p>Current page: {{ page }}</p>
  </div>
</template>

<script setup lang="ts">
interface PaginationOptions {
  currentPage?: number;
  itemCount: number;
  itemsPerPage?: number;
  pageSizes?: number[];
}

const options = ref<PaginationOptions>({
  itemCount: 96,
  itemsPerPage: 10,
  pageSizes: [10, 25, 50],
});

const page = ref(1);

const onChange = (event: Event) => {
  page.value = (event as CustomEvent<PaginationOptions>).detail.currentPage ?? 1;
};
</script>
