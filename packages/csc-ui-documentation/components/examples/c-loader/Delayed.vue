<template>
  <component-example name="delayed" rows>
    <template #title>Delayed message</template>

    <c-card>
      <c-loader v-if="loader" contentdelay="2">
        This loader will disappear soon
      </c-loader>

      <c-card-title>Loader card</c-card-title>

      <c-card-content>
        Click start to show a loader with a delayed explanation text
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
