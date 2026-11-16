<template>
  <div class="example-row">
    <c-status marker="dot" type="info">
      <c-icon slot="icon" :path="mdiArchive" />
      Archived
    </c-status>

    <c-status appearance="outlined" marker="icon">
      <c-icon slot="icon" :path="mdiArchive" />
      Archived
    </c-status>
  </div>
</template>

<script setup lang="ts">
import { mdiArchive } from '@mdi/js';
</script>
