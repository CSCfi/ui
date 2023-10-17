<template>
  <component-example name="icon">
    <template #title>With icon</template>

    <c-button>
      <c-icon :path="mdiLogin"></c-icon>
      Login
    </c-button>

    <c-button ghost>
      <c-icon :path="mdiLogout"></c-icon>
      Logout
    </c-button>

    <c-button disabled>
      <c-icon :path="mdiLogin"></c-icon>
      Login
    </c-button>

    <c-button text>
      Next
      <c-icon :path="mdiArrowRight"></c-icon>
    </c-button>

    <c-button danger>
      <c-icon :path="mdiDelete"></c-icon>
      Delete
    </c-button>
  </component-example>
</template>

<script setup lang="ts">
import { mdiArrowRight, mdiDelete, mdiLogin, mdiLogout } from '@mdi/js';
</script>
