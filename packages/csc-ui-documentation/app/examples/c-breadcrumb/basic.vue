<template>
  <c-breadcrumb>
    <c-breadcrumb-item aria-label="Home" href="https://csc.fi">
      <c-icon slot="icon" :path="mdiHome" :size="20" />
    </c-breadcrumb-item>

    <c-breadcrumb-item href="https://csc.fi/en/services">
      Services
    </c-breadcrumb-item>

    <c-breadcrumb-item>Supercomputers</c-breadcrumb-item>
  </c-breadcrumb>
</template>

<script setup lang="ts">
import { mdiHome } from '@mdi/js';
</script>
