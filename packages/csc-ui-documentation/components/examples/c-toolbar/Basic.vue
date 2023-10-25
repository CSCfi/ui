<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-toolbar class="relative">
      <c-csc-logo />

      Application title

      <c-spacer />

      <c-menu :items="items" custom>
        <c-icon-button ghost badge="4" tabindex="-1" size="small">
          <c-icon :path="mdiEmailOutline" />
        </c-icon-button>
      </c-menu>

      <c-navigation-button />
    </c-toolbar>
  </component-example>
</template>

<script setup lang="ts">
import { mdiEmailOutline } from '@mdi/js';

const items = [
  { name: 'Item 1', action: () => alert('Item 1 selected') },
  { name: 'Item 2', action: () => alert('Item 2 selected') },
  { name: 'Item 3', action: () => alert('Item 3 selected'), disabled: true },
  { name: 'Item 4', action: () => alert('Item 4 selected') },
];
</script>
