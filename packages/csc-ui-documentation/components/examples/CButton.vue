<template>
  <component-example name="variants">
    <template #title>Variants</template>

    <c-button>Default</c-button>
    <c-button outlined>Outlined</c-button>
    <c-button ghost>Ghost</c-button>
    <c-button text>Text</c-button>
    <c-button danger>Danger</c-button>
  </component-example>

  <component-example name="loading">
    <template #title>Loading state</template>

    <c-button loading>Default</c-button>
    <c-button loading outlined>Outlined</c-button>
    <c-button loading ghost>Ghost</c-button>
    <c-button loading text>Text</c-button>
    <c-button loading danger>Danger</c-button>
  </component-example>

  <component-example name="disabled">
    <template #title>Disabled state</template>

    <c-button disabled>Default</c-button>
    <c-button disabled outlined>Outlined</c-button>
    <c-button disabled ghost>Ghost</c-button>
    <c-button disabled text>Text</c-button>
    <c-button disabled danger>Danger</c-button>
  </component-example>

  <component-example name="icon">
    <template #title>With icon</template>

    <c-button>
      <c-icon slot="icon" :path="mdiLogin"></c-icon>
      Login
    </c-button>

    <c-button ghost>
      <c-icon slot="icon" :path="mdiLogout"></c-icon>
      Logout
    </c-button>

    <c-button disabled>
      <c-icon slot="icon" :path="mdiLogin"></c-icon>
      Login
    </c-button>

    <c-button text icon-end>
      <c-icon slot="icon" :path="mdiArrowRight"></c-icon>
      Next
    </c-button>

    <c-button danger>
      <c-icon slot="icon" :path="mdiDelete"></c-icon>
      Delete
    </c-button>
  </component-example>
</template>

<script setup lang="ts">
// @example-start|icon
import { mdiArrowRight, mdiDelete, mdiLogin, mdiLogout } from '@mdi/js';
// @example-end
</script>

<style lang="scss"></style>
