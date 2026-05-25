<template>
  <div class="grid gap-6">
    <code-block
      v-for="(definition, index) in types.get(component)"
      :key="`definition-${index}`"
      :code="definition"
      theme="atom-one-dark"
      lang="typescript"
      code-block-radius="6px"
      highlightjs
      persistent-copy-button
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

const route = useRoute();

const component = route.params.slug[0];

const { types } = storeToRefs(useExampleStore());
</script>

<style lang="scss"></style>
