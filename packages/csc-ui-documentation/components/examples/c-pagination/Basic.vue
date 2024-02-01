<template>
  <component-example name="basic" rows>
    <template #title>Default</template>

    <c-tags>
      <c-tag v-for="country in filteredCountries" :key="country">
        {{ country }}
      </c-tag>
    </c-tags>

    <c-pagination v-model="options" v-control />
  </component-example>
</template>

<script setup lang="ts">
import { CPaginationOptions } from '@cscfi/csc-ui';
import countries from '../../data/countries.json';

const countriesList = Object.values(countries).sort();

const filteredCountries = computed(() =>
  countriesList.slice(options.value.startFrom, (options.value?.endTo || 0) + 1),
);

const options = ref<CPaginationOptions>({
  itemCount: countriesList.length,
  itemsPerPage: 15,
  currentPage: 1,
  startFrom: 0,
  endTo: 24,
  pageSizes: [5, 10, 15, 25, 50],
});
</script>
