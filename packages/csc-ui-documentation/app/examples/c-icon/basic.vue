<template>
  <div class="example-row">
    <c-icon :path="mdiAccount" />

    <c-icon :path="mdiBellOutline" size="36" />

    <c-icon :path="mdiCheckCircle" color="var(--c-success)" size="36" />
  </div>
</template>

<script setup lang="ts">
import { mdiAccount, mdiBellOutline, mdiCheckCircle } from '@mdi/js';
</script>
