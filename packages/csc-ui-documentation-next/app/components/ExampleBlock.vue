<template>
  <figure class="example">
    <figcaption class="example-title">{{ example.title }}</figcaption>

    <div class="example-demo">
      <!-- Interactive demos are client-only: the csc-ui custom elements upgrade
           only on the client, and Vue's SSR compiler (@vue/compiler-ssr) errors
           on `v-model` on a custom element when `isCustomElement` is set. -->
      <ClientOnly>
        <component :is="example.demo" />
      </ClientOnly>
    </div>

    <div class="example-code">
      <div class="example-tabs" role="tablist">
        <button
          v-for="tab in example.tabs"
          :key="tab.label"
          :aria-selected="tab.label === activeLabel"
          class="example-tab"
          :class="{ active: tab.label === activeLabel }"
          role="tab"
          type="button"
          @click="activeLabel = tab.label"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- eslint-disable-next-line vue/no-v-html — Shiki output built at prerender from our own SFC source -->
      <div v-if="activeHtml" class="example-shiki" v-html="activeHtml" />
      <pre v-else><code>{{ activeCode }}</code></pre>
    </div>
  </figure>
</template>

<script setup lang="ts">
import type { DocExample } from '~/composables/useExamples';

const { example, html } = defineProps<{
  example: DocExample;
  // label -> pre-highlighted HTML, keyed as produced on the page
  html?: Record<string, string>;
}>();

const activeLabel = ref(example.tabs[0]?.label ?? 'Vue');

const activeCode = computed(
  () => example.tabs.find((tab) => tab.label === activeLabel.value)?.code ?? '',
);

const activeHtml = computed(() => html?.[activeLabel.value] ?? '');
</script>
