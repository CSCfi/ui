<template>
  <div class="example-row">
    <span style="position: relative">
      <c-icon :path="mdiBellOutline" size="32" />

      <c-badge>3</c-badge>
    </span>

    <c-icon-button outlined>
      <c-icon :path="mdiEmailOutline" />

      <c-badge class="success-badge">1</c-badge>
    </c-icon-button>

    <c-button>
      Default
      <c-badge>2</c-badge>
    </c-button>
  </div>
</template>

<script setup lang="ts">
import { mdiBellOutline, mdiEmailOutline } from '@mdi/js';
</script>

<style>
c-badge.success-badge::part(root) {
  background-color: var(--c-success-500);
}
</style>
