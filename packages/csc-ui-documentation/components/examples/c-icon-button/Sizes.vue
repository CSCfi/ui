<template>
  <component-example name="sizes">
    <template #title>Sizes</template>

    <c-icon-button size="x-small">
      <c-icon :path="mdiStar" />
    </c-icon-button>

    <c-icon-button size="small">
      <c-icon :path="mdiStar" />
    </c-icon-button>

    <c-icon-button>
      <c-icon :path="mdiStar" />
    </c-icon-button>
  </component-example>
</template>

<script setup lang="ts">
import { mdiStar } from '@mdi/js';
</script>
