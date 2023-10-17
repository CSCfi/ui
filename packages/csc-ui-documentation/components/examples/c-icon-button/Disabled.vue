<template>
  <component-example>
    <template #title>Disabled</template>

    <c-icon-button disabled>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button outlined disabled>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button ghost disabled>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button text disabled>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button danger disabled>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>
  </component-example>
</template>

<script setup lang="ts">
import { mdiStar } from '@mdi/js';
</script>
