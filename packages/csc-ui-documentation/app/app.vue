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

const isNextImpl = config.public.cscUiImpl === 'next';

const { init: initTheme } = useTheme();

if (isNextImpl) {
  // Load the semantic-token layer so the migrated components theme
  // and dark mode can activate via `data-theme`. Only in `next` mode — the
  // Stencil theme (imported globally in main.css) stays the single source in
  // `stencil` mode.
  await import('@cscfi/csc-ui-next/css/tokens.css');

  // Register the Vue-built migrated components first. The Stencil loader
  // skips tags already in the registry, so unmigrated components fall
  // back to Stencil without extra coordination.
  const { defineCustomElements: defineNextElements } =
    await import('@cscfi/csc-ui-next');
  defineNextElements();
}

defineStencilElements();

// Resolve the persisted / OS-preferred theme on mount (client-only SPA).
onMounted(() => {
  if (isNextImpl) initTheme();
});
</script>
