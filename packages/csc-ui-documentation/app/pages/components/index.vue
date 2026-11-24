<template>
  <article>
    <h1 class="mb-[0.67em] text-[2rem] font-bold">Components</h1>

    <p class="my-[1em] max-w-[45rem] text-[1.0625rem] text-on-surface-muted">
      {{ navComponents.length }} components, documented straight from the
      library's Custom Elements Manifest — the tables on every page are
      generated from the same source the build verifies.
    </p>

    <ul
      class="my-[1em] grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3"
    >
      <li v-for="component in navComponents" :key="component.tagName">
        <nuxt-link
          :to="`/components/${component.tagName}`"
          class="block h-full overflow-hidden rounded-lg border border-border text-inherit no-underline hover:border-primary"
        >
          <!-- A picture of the component's live example, one per theme mode
               (scripts/component-previews.mjs); site.css shows the one for
               the current mode. Decorative: the tag and the description name
               the component. -->
          <span class="block aspect-[8/5] border-b border-border">
            <img
              v-for="mode in ['light', 'dark']"
              :key="mode"
              :class="`component-preview-${mode}`"
              :src="`/previews/${component.tagName}-${mode}.webp`"
              alt=""
              class="size-full object-cover"
              height="275"
              loading="lazy"
              width="440"
            />
          </span>

          <span class="block px-4 py-[0.875rem]">
            <code>&lt;{{ component.tagName }}&gt;</code>

            <span
              v-if="component.description"
              class="mt-1.5 block text-[0.8125rem] text-on-surface-faint"
            >
              {{ firstSentence(component.description) }}
            </span>
          </span>
        </nuxt-link>
      </li>
    </ul>
  </article>
</template>

<script setup lang="ts">
const { navComponents } = useManifest();

const firstSentence = (text: string) => text.split(/(?<=\.)\s/)[0];

useHead({ title: 'Components — CSC Design System' });
</script>
