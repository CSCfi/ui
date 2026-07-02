<template>
  <div class="example-row">
    <c-icon :path="mdiAccount" />
    <c-icon :path="mdiBellOutline" size="36" />
    <c-icon :path="mdiCheckCircle" size="36" color="var(--c-success)" />
  </div>
</template>

<script setup lang="ts">
import { mdiAccount, mdiBellOutline, mdiCheckCircle } from '@mdi/js';
</script>
