<template>
  <figure class="example">
    <figcaption class="example-title">{{ example.title }}</figcaption>

    <div class="example-demo">
      <component :is="example.demo" />
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

      <pre><code>{{ activeCode }}</code></pre>
    </div>
  </figure>
</template>

<script setup lang="ts">
import type { DocExample } from '~/composables/useExamples';

const { example } = defineProps<{ example: DocExample }>();

const activeLabel = ref(example.tabs[0]?.label ?? 'Vue');

const activeCode = computed(
  () =>
    example.tabs.find((tab) => tab.label === activeLabel.value)?.code ?? '',
);
</script>
