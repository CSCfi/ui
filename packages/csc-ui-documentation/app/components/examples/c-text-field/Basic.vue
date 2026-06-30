<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-text-field label="Text field"><c-icon slot="pre" :path="mdiGlobeModel"></c-icon></c-text-field>
  </component-example>
</template>

<script setup lang="ts">
import { mdiGlobeModel } from '@mdi/js';

</script>
