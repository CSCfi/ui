<template>
  <component-example name="variants" rows>
    <template #title>Variants</template>

    <c-link href="https://csc.fi" style="--c-link-color: var(--c-warning-600)">
      Link with custom color
    </c-link>

    <c-link href="https://csc.fi" weight="400">Link with custom weight</c-link>

    <c-link href="https://csc.fi" target="_blank">
      Link with icon
      <c-icon :path="mdiOpenInNew" color="var(--c-primary-600)" size="18" />
    </c-link>

    <c-link href="https://csc.fi" color="error" target="_blank">
      <c-icon :path="mdiOpenInNew" size="18" />
      Link with icon in front
    </c-link>
  </component-example>
</template>

<script setup lang="ts">
import { mdiOpenInNew } from '@mdi/js';
</script>
