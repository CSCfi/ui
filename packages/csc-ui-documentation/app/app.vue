<template>
  <div>
    <nuxt-layout>
      <nuxt-page />
    </nuxt-layout>
  </div>
</template>

<script lang="ts" setup>
import { defineCustomElements as defineStencilElements } from '@cscfi/csc-ui/loader';

const config = useRuntimeConfig();

if (config.public.cscUiImpl === 'next') {
  // Register the Vue-built migrated components first. The Stencil loader
  // skips tags already in the registry, so unmigrated components fall
  // back to Stencil without extra coordination.
  const { defineCustomElements: defineNextElements } = await import('@cscfi/csc-ui-next');
  defineNextElements();
}

defineStencilElements();
</script>
