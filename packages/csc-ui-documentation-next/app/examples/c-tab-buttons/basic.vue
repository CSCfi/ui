<template>
  <div class="example-row">
    <c-tab-buttons :value.prop="view" mandatory @change-value="onChange">
      <c-tab-button value="day">Day</c-tab-button>

      <c-tab-button value="week">Week</c-tab-button>

      <c-tab-button value="month">Month</c-tab-button>
    </c-tab-buttons>

    <span>Selected: {{ view }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const view = ref<number | string>('week');

const onChange = (event: Event) => {
  view.value = (event as CustomEvent<number | string>).detail;
};
</script>
