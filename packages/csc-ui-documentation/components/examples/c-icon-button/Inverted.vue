<template>
  <component-example>
    <template #title>Inverted</template>

    <c-row gap="16" class="bg-primary-600 p-2 rounded-md">
      <c-icon-button inverted>
        <c-icon :path="mdiStar" />
      </c-icon-button>

      <c-icon-button inverted outlined>
        <c-icon :path="mdiStar" />
      </c-icon-button>

      <c-icon-button inverted ghost>
        <c-icon :path="mdiStar" />
      </c-icon-button>

      <c-icon-button inverted text>
        <c-icon :path="mdiStar" />
      </c-icon-button>

      <c-icon-button inverted danger>
        <c-icon :path="mdiStar" />
      </c-icon-button>
    </c-row>
  </component-example>
</template>

<script setup lang="ts">
import { mdiStar } from '@mdi/js';
</script>
