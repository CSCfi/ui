<template>
  <component-example>
    <template #title>Loading</template>

    <c-icon-button loading>
      <c-icon :path="mdiStar" />
    </c-icon-button>

    <c-icon-button outlined loading>
      <c-icon :path="mdiStar" />
    </c-icon-button>

    <c-icon-button ghost loading>
      <c-icon :path="mdiStar" />
    </c-icon-button>

    <c-icon-button text loading>
      <c-icon :path="mdiStar" />
    </c-icon-button>

    <c-icon-button danger loading>
      <c-icon :path="mdiStar" />
    </c-icon-button>
  </component-example>
</template>

<script setup lang="ts">
import { mdiStar } from '@mdi/js';
</script>
