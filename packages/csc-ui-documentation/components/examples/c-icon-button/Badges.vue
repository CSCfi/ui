<template>
  <component-example>
    <template #title>Badges</template>

    <c-icon-button badge="8">
      <c-icon :path="mdiStar" />
    </c-icon-button>

    <c-icon-button badge="6" outlined>
      <c-icon :path="mdiStar" />
    </c-icon-button>

    <c-icon-button badge="1" ghost>
      <c-icon :path="mdiStar" />
    </c-icon-button>

    <c-icon-button badge="new" text>
      <c-icon :path="mdiStar" />
    </c-icon-button>

    <c-icon-button badge="1" danger>
      <c-icon :path="mdiStar" />
    </c-icon-button>
  </component-example>
</template>

<script setup lang="ts">
import { mdiStar } from '@mdi/js';
</script>
