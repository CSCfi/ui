<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-row align="end">
      <c-icon
        :path="mdiArrowRightBoldOutline"
        size="64"
        color="var(--c-primary-600)"
      />

      <c-spacer />

      <c-icon
        :path="mdiArrowLeftBoldOutline"
        size="64"
        color="var(--c-primary-600)"
      />
    </c-row>
  </component-example>
</template>

<script setup lang="ts">
import { mdiArrowLeftBoldOutline, mdiArrowRightBoldOutline } from '@mdi/js';
</script>
