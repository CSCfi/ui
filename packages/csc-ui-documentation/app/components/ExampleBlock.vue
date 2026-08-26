<template>
  <figure
    :id="exampleAnchor(example.name)"
    class="my-6 scroll-mt-20 overflow-hidden rounded-lg border border-border"
  >
    <figcaption
      class="border-b border-border bg-surface-muted px-4 py-2 text-[0.8125rem] font-semibold text-on-surface-faint"
    >
      {{ example.title }}
    </figcaption>

    <!-- Demo pane: white in light mode, the c-main app canvas in dark, so
         examples render against the surface they'd meet in a real app
         (see .example-demo in assets/site.css). -->
    <div class="example-demo px-4 py-6">
      <!-- The live demo is always the Vue canon (compiled SFC), whatever the
           selected flavor — the variants differ in source, not behavior.
           Client-only: the csc-ui custom elements upgrade only on the client,
           and Vue's SSR compiler (@vue/compiler-ssr) errors on `v-model` on a
           custom element when `isCustomElement` is set. -->
      <client-only>
        <component :is="example.demo" />
      </client-only>
    </div>

    <div class="border-t border-border">
      <div
        class="flex gap-1 border-t border-border bg-surface-muted p-2"
        role="tablist"
      >
        <!-- Changing a tab switches the documentation-wide flavor, not just
             this block. Controlled via `:value`: the group owns the active
             button and re-syncs it from its `value` watch, so a flavor change
             made elsewhere (e.g. the header FlavorSwitcher) updates this
             block's active tab too. -->
        <c-button-group
          data-flavor-tabs
          mandatory
          :value="activeTab.flavor"
          @input="onFlavorChange"
        >
          <c-button
            v-for="tab in example.tabs"
            :key="tab.flavor"
            :value="tab.flavor"
            :aria-selected="tab.flavor === activeTab.flavor"
          >
            <c-icon
              :path="tab.icon"
              :size="16"
              :class="ICON_COLORS[tab.flavor]"
            />

            {{ tab.label }}
          </c-button>
        </c-button-group>
      </div>

      <!-- Multi-pane variants (the TypeScript flavor's markup + wiring pair)
           stack one pane per part; the chip label carries the parts'
           relationship — the code itself holds no linkage line. -->
      <template
        v-for="(pane, index) in activeTab.panes"
        :key="pane.label ?? index"
      >
        <div
          v-if="pane.label"
          class="border-t border-border bg-surface-muted px-5 py-1.5 text-xs font-medium text-on-surface-faint"
        >
          {{ pane.label }}
        </div>

        <!-- eslint-disable vue/no-v-html — Shiki output built at prerender from our own example source -->
        <div
          v-if="activeHtml[index]"
          class="example-shiki"
          v-html="activeHtml[index]"
        />
        <!-- eslint-enable vue/no-v-html -->

        <pre
          v-else
          class="m-0 overflow-x-auto bg-[#0f172a] px-5 py-4 text-[0.8125rem] text-[#e2e8f0]"
        ><code class="bg-transparent p-0">{{ pane.code }}</code></pre>
      </template>
    </div>
  </figure>
</template>

<script setup lang="ts">
import type { DocExample, ExampleTab } from '~/composables/useExamples';

const { example, html = {} } = defineProps<{
  example: DocExample;
  // flavor id -> pre-highlighted HTML per pane, keyed as produced on the page
  html?: Record<string, string[]>;
}>();

const { flavor, setFlavor } = useFlavor();

// The selected flavor's tab; a block missing that variant falls back to the
// Vue canon without touching the global selection.
const activeTab = computed<ExampleTab>(
  () =>
    example.tabs.find((tab) => tab.flavor === flavor.value) ??
    (example.tabs[0] as ExampleTab),
);

const activeHtml = computed(() => html?.[activeTab.value.flavor] ?? []);

const onFlavorChange = (flavor: Event) => {
  setFlavor((flavor.target as HTMLInputElement).value as Flavor);
};

const currentIconColor = computed(() => {
  return ICON_COLORS[activeTab.value.flavor]
    .replace('text-[', '')
    .replace(']', '');
});
</script>

<style scoped>
/* Scope the flavor-tab restyle to the explicit [data-flavor-tabs] hook: a
   bare `c-button-group` selector would also match an example DEMO whose
   single root element is a c-button-group — Vue stamps this component's
   scope id onto a child component's root, so the demo would inherit these
   part overrides and render "broken". A data attribute (not a class) so
   imperative host classes never trip Vue's hydration class-mismatch check. */
c-button-group[data-flavor-tabs] {
  &::part(root) {
    background-color: var(--c-surface);
  }
}

c-button-group[data-flavor-tabs] c-button {
  &::part(root) {
    color: var(--c-on-surface);
  }

  /* The group has no sliding indicator — each active button paints its own
     fill, restyled here to the selected flavor's tint. */
  &[active]::part(root) {
    background-color: color-mix(
      in srgb,
      v-bind(currentIconColor) 10%,
      transparent
    );
    box-shadow: inset 0 0 0 1px v-bind(currentIconColor);
  }

  &:not([active])::part(root):hover {
    background-color: transparent;
  }
}
</style>
