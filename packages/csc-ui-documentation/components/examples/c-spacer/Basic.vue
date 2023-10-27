<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-row align="end">
      <c-icon :path="mdiForklift" size="128" color="var(--c-info-700)" />

      <c-spacer />

      <c-icon
        :path="mdiPackageVariantClosed"
        size="128"
        color="var(--c-warning-500)"
      />
    </c-row>
  </component-example>
</template>

<script setup lang="ts">
import { mdiForklift, mdiPackageVariantClosed } from '@mdi/js';
</script>
