<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script lang="ts" setup>
import { defineCustomElements } from 'csc-ui/loader';

defineCustomElements();
</script>
