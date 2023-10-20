<template>
  <component-example name="simple" rows>
    <template #title>Simple variant with programmatical control</template>

    <div>
      <c-tags>
        <c-tag v-for="country in filteredCountries" :key="country">
          {{ country }}
        </c-tag>
      </c-tags>

      <c-pagination v-model="options" v-control hide-details simple />
    </div>

    <p>Programmatically change pagination values:</p>
    <c-row gap="8">
      <c-button @click="setPageToTwo()">Page 2</c-button>
      <c-button @click="showFiftyItemsPerPage()">50 items per page</c-button>
    </c-row>
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
  itemsPerPage: 25,
  currentPage: 1,
  startFrom: 0,
  endTo: 24,
});

const setPageToTwo = () => {
  options.value = { ...options.value, currentPage: 2 };
};

const showFiftyItemsPerPage = () => {
  options.value = { ...options.value, itemsPerPage: 50 };
};
</script>
