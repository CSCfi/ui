<template>
  <div>
    <c-pagination :value.prop="options" hide-details simple @changeValue="onChange" />

    <p>Current page: {{ page }}</p>
  </div>
</template>

<script setup lang="ts">
interface PaginationOptions {
  currentPage?: number;
  itemCount: number;
  itemsPerPage?: number;
}

const options = ref<PaginationOptions>({
  itemCount: 40,
  itemsPerPage: 10,
});

const page = ref(1);

const onChange = (event: Event) => {
  page.value = (event as CustomEvent<PaginationOptions>).detail.currentPage ?? 1;
};
</script>
