<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-card>
      <c-loader v-if="loader">Loading...</c-loader>

      <c-card-title>Loader card</c-card-title>

      <c-card-content>
        Click start to show a loader for 5 seconds
      </c-card-content>

      <c-card-actions>
        <c-button @click="startLoader()">Start</c-button>
      </c-card-actions>
    </c-card>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const loader = ref(false);

const startLoader = () => {
  loader.value = true;

  setTimeout(() => {
    loader.value = false;
  }, 5000);
};
</script>
