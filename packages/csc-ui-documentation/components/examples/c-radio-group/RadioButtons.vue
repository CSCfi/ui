<template>
  <component-example name="radio-buttons" rows>
    <template #title>Usage with c-radio elements</template>

    <c-radio-group v-model="selection" v-control>
      Radio Group with c-radio elements

      <c-radio value="one">Radio one</c-radio>

      <c-radio value="two" checked>Radio two</c-radio>

      <c-radio value="three" disabled>Radio three</c-radio>
    </c-radio-group>

    <p class="mb-6">Selected: {{ selection }}</p>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const selection = ref('');
</script>
