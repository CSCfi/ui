<template>
  <div class="example-row">
    <c-button-group v-model="view">
      <c-button value="day">Day</c-button>

      <c-button value="week">Week</c-button>

      <c-button value="month">Month</c-button>
    </c-button-group>

    <p>Selected: {{ view ?? 'none' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const view = ref<string | null>('week');
</script>
