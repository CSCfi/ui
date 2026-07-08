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
          class="block h-full rounded-lg border border-border px-4 py-[0.875rem] text-inherit no-underline hover:border-primary"
          :to="`/components/${component.tagName}`"
        >
          <code>&lt;{{ component.tagName }}&gt;</code>

          <p
            v-if="component.description"
            class="mt-1.5 text-[0.8125rem] text-on-surface-faint"
          >
            {{ firstSentence(component.description) }}
          </p>
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
