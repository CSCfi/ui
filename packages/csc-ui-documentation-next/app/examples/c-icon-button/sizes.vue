<template>
  <div class="example-row">
    <c-icon-button size="x-small">
      <c-icon :path="mdiMagnify" />
    </c-icon-button>

    <c-icon-button size="small">
      <c-icon :path="mdiMagnify" />
    </c-icon-button>

    <c-icon-button>
      <c-icon :path="mdiMagnify" />
    </c-icon-button>
  </div>
</template>

<script setup lang="ts">
import { mdiMagnify } from '@mdi/js';
</script>
