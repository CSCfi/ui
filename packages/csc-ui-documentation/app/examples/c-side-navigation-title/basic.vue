<docs>surface: canvas</docs>

<template>
  <div>
    <c-side-navigation>
      <c-side-navigation-title>Services</c-side-navigation-title>

      <c-side-navigation-item>
        <c-icon :path="mdiDatabaseOutline" />
        Data storage
      </c-side-navigation-item>

      <c-side-navigation-item>
        <c-icon :path="mdiServerNetwork" />
        Computing
      </c-side-navigation-item>

      <c-side-navigation-title>Support</c-side-navigation-title>

      <c-side-navigation-item>
        <c-icon :path="mdiHelpCircleOutline" />
        User guides
      </c-side-navigation-item>
    </c-side-navigation>
  </div>
</template>

<script setup lang="ts">
import {
  mdiDatabaseOutline,
  mdiHelpCircleOutline,
  mdiServerNetwork,
} from '@mdi/js';
</script>
