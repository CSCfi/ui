<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>
    <c-switch v-model="switch1" v-control>
      {{ switch1 ? 'Active' : 'Inactive' }}
    </c-switch>

    <c-switch v-model="switch2" v-control>
      {{ switch2 ? 'Active' : 'Inactive' }}
    </c-switch>

    <c-switch required>Required</c-switch>

    <c-switch value="true" disabled>Disabled, active</c-switch>

    <c-switch disabled>Disabled</c-switch>
  </component-example>
</template>

<script setup lang="ts">
// @example-start|basic
import { ref } from 'vue';

const switch1 = ref(false);

const switch2 = ref(true);
// @example-end
</script>

<style lang="scss"></style>
