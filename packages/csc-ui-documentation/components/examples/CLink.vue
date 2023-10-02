<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-link href="https://csc.fi">Default link</c-link>
    <c-link href="https://csc.fi" underline>Underlined link</c-link>
  </component-example>

  <component-example name="variants" rows>
    <template #title>Variants</template>

    <c-link href="https://csc.fi" style="--c-link-color: var(--c-warning-600)">
      Link with custom color
    </c-link>

    <c-link href="https://csc.fi" weight="400">Link with custom weight</c-link>

    <c-link href="https://csc.fi" target="_blank">
      Link with icon
      <c-icon
        :path="mdiOpenInNew"
        color="var(--c-primary-600)"
        size="18"
      ></c-icon>
    </c-link>

    <c-link href="https://csc.fi" color="error" target="_blank">
      <c-icon :path="mdiOpenInNew" size="18"></c-icon>
      Link with icon in front
    </c-link>
  </component-example>
</template>

<script setup lang="ts">
// @example-start|variants
import { mdiOpenInNew } from '@mdi/js';
// @example-end
</script>
<style lang="scss"></style>
