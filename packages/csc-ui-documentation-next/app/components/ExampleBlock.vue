<template>
  <figure class="my-6 overflow-hidden rounded-lg border border-border">
    <figcaption
      class="border-b border-border bg-surface-muted px-4 py-2 text-[0.8125rem] font-semibold text-on-surface-faint"
    >
      {{ example.title }}
    </figcaption>

    <div class="px-4 py-6">
      <!-- The live demo is always the Vue canon (compiled SFC), whatever the
           selected flavor — the variants differ in source, not behavior.
           Client-only: the csc-ui custom elements upgrade only on the client,
           and Vue's SSR compiler (@vue/compiler-ssr) errors on `v-model` on a
           custom element when `isCustomElement` is set. -->
      <ClientOnly>
        <component :is="example.demo" />
      </ClientOnly>
    </div>

    <div class="border-t border-border">
      <div
        class="flex gap-1 border-t border-border bg-surface-muted p-2"
        role="tablist"
      >
        <!-- Changing a tab switches the documentation-wide flavor, not just
             this block (ADR-0020). -->
        <c-tab-buttons mandatory @input="onFlavorChange" >
          <c-tab-button
            v-for="tab in example.tabs"
            :key="tab.flavor"
            :value="tab.flavor"
            :active="tab.flavor === activeTab.flavor"
            :aria-selected="tab.flavor === activeTab.flavor"
          >
            <c-icon :path="tab.icon" :size="16" :class="ICON_COLORS[tab.flavor]" />

            {{ tab.label }}
          </c-tab-button>
        </c-tab-buttons>
      </div>

      <!-- eslint-disable-next-line vue/no-v-html — Shiki output built at prerender from our own SFC source -->
      <div v-if="activeHtml" class="example-shiki" v-html="activeHtml" />
      <pre
        v-else
        class="m-0 overflow-x-auto bg-[#0f172a] px-5 py-4 text-[0.8125rem] text-[#e2e8f0]"
      ><code class="bg-transparent p-0">{{ activeTab.code }}</code></pre>
    </div>
  </figure>
</template>

<script setup lang="ts">
import type { DocExample, ExampleTab } from '~/composables/useExamples';

const { example, html } = defineProps<{
  example: DocExample;
  // flavor id -> pre-highlighted HTML, keyed as produced on the page
  html?: Record<string, string>;
}>();

const { flavor, setFlavor } = useFlavor();

// The selected flavor's tab; a block missing that variant falls back to the
// Vue canon without touching the global selection.
const activeTab = computed<ExampleTab>(
  () =>
    example.tabs.find((tab) => tab.flavor === flavor.value) ??
    (example.tabs[0] as ExampleTab),
);

const activeHtml = computed(() => html?.[activeTab.value.flavor] ?? '');

const onFlavorChange = (flavor: Event) => {
  setFlavor((flavor.target as HTMLInputElement).value as Flavor);
};

const currentIconColor = computed(() => {
  return ICON_COLORS[activeTab.value.flavor].replace('text-[', '').replace(']', '');
});
</script>

<style scoped>
c-tab-buttons {
  &::part(root) {
    background-color: var(--c-surface);
  }

  &::part(indicator) {
    background-color: color-mix(in srgb, v-bind(currentIconColor) 10%, transparent);
    box-shadow: inset 0 0 0 1px v-bind(currentIconColor);
  }
}

c-tab-button {
  &::part(root) {
    color: var(--c-on-surface);
  }

  &:not([active])::part(root):hover {
    background-color: transparent;
  }
}
</style>
