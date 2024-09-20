<template>
  <component-example name="titleactions">
    <template #title>Actions in the title</template>

    <c-card>
      <c-card-title>
        Lorem ipsum dolor sit amet

        <c-button slot="actions" size="small" ghost>
          <c-icon :path="mdiInformationOutline" />
          mdiInformationOutline
        </c-button>

        <c-button slot="actions" size="small">
          <c-icon :path="mdiPlus" />
          Request for access
        </c-button>
      </c-card-title>

      <c-card-content>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </c-card-content>
    </c-card>
  </component-example>
</template>

<script setup lang="ts">
import { mdiInformationOutline, mdiPlus } from '@mdi/js';
</script>
