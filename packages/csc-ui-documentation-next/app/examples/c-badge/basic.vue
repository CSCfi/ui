<template>
  <div class="example-row">
    <span style="position: relative">
      <c-icon :path="mdiBellOutline" size="32" />
      <c-badge>3</c-badge>
    </span>

    <span style="position: relative">
      <c-icon :path="mdiEmailOutline" size="32" />
      <c-badge>12</c-badge>
    </span>
  </div>
</template>

<script setup lang="ts">
import { mdiBellOutline, mdiEmailOutline } from '@mdi/js';
</script>
