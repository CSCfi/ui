<template>
  <component-example rows name="basic">
    <template #title>Basic usage</template>

    <c-icon :path="mdiMail" />

    <div class="text-primary">
      <!-- Color inherited from parent -->
      <c-icon :path="mdiMail" />
    </div>

    <!-- Color as a CSS variable -->
    <c-icon :path="mdiHome" color="var(--c-info-600)" />

    <!-- Path as string, color as hex -->
    <c-icon
      path="M10,4H14V13L17.5,9.5L19.92,11.92L12,19.84L4.08,11.92L6.5,9.5L10,13V4Z"
      size="64"
      color="#830351"
    />
  </component-example>
</template>

<script setup lang="ts">
import { mdiHome, mdiMail } from '@mdi/js';
</script>
