<template>
  <component-example>
    <template #title>Variants</template>

    <c-icon-button>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button outlined>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button ghost>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button text>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>

    <c-icon-button danger>
      <c-icon :path="mdiStar"></c-icon>
    </c-icon-button>
  </component-example>
</template>

<script setup lang="ts">
import { mdiStar } from '@mdi/js';
</script>
