<template>
  <div class="example-row">
    <c-icon-button aria-label="Search" size="x-small">
      <c-icon :path="mdiMagnify" />
    </c-icon-button>

    <c-icon-button aria-label="Search" size="small">
      <c-icon :path="mdiMagnify" />
    </c-icon-button>

    <c-icon-button aria-label="Search">
      <c-icon :path="mdiMagnify" />
    </c-icon-button>
  </div>
</template>

<script setup lang="ts">
import { mdiMagnify } from '@mdi/js';
</script>
