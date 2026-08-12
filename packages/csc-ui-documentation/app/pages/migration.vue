<template>
  <div class="flex items-start gap-10">
    <article class="min-w-0 max-w-[52rem] flex-1">
      <h1 class="mb-[0.67em] text-[2rem] font-bold">Migration guide</h1>

      <p class="my-[1em] max-w-[45rem] text-[1.0625rem] text-on-surface-muted">
        How to upgrade an app from the Stencil package
        <code>@cscfi/csc-ui</code>

        to
        <code>@cscfi/csc-ui</code>
        . The
        <code>&lt;c-*&gt;</code>
        tag names are unchanged; what changes is installation, registration,
        two-way binding, customization, and theming. Pick your flavor with the
        switcher in the header (or below on small screens).
      </p>

      <flavor-switcher class="md:hidden" />

      <section v-for="section in sections" :key="section.id" class="mt-10">
        <h2
          :id="section.id"
          class="my-[0.83em] scroll-mt-20 border-b border-border pb-1.5 text-2xl font-bold"
        >
          {{ section.title }}
        </h2>

        <p
          class="my-[1em] max-w-180 whitespace-pre-line text-on-surface-muted"
        >
          {{ section.intro[flavor] ?? section.intro.all }}
        </p>

        <figure
          v-for="(block, index) in section.blocks[flavor]"
          :key="`${section.id}-${flavor}-${index}`"
          class="my-4 overflow-hidden rounded-lg border border-border"
        >
          <figcaption
            v-if="block.filename"
            class="border-b border-border bg-surface-muted px-4 py-2 font-mono text-[0.75rem] text-on-surface-faint"
          >
            {{ block.filename }}
          </figcaption>

          <!-- eslint-disable vue/no-v-html — Shiki output built at prerender from our own snippets -->
          <div
            v-if="blocksHtml[`${section.id}:${flavor}:${index}`]"
            class="example-shiki"
            v-html="blocksHtml[`${section.id}:${flavor}:${index}`]"
          />
          <!-- eslint-enable vue/no-v-html -->

          <pre
            v-else
            class="m-0 overflow-x-auto bg-[#0f172a] px-5 py-4 text-[0.8125rem] text-[#e2e8f0]"
          ><code class="bg-transparent p-0">{{ block.code }}</code></pre>
        </figure>

        <p v-if="section.link" class="my-[1em]">
          <nuxt-link class="font-semibold underline" :to="section.link.to">
            {{ section.link.label }} →
          </nuxt-link>
        </p>
      </section>
    </article>

    <toc-rail :items="tocItems" />
  </div>
</template>

<script setup lang="ts">
import { MIGRATION_SECTIONS, type MigrationSection } from '~/content/migration';
import type { TocItem } from '~/utils/toc';

const sections: MigrationSection[] = MIGRATION_SECTIONS;

// "On this page" rail links — one per section.
const tocItems: TocItem[] = sections.map((section) => ({
  id: section.id,
  label: section.title,
}));

const { flavor } = useFlavor();

// Highlight every flavor's blocks at prerender (see utils/highlight.ts);
// switching flavor swaps pre-highlighted HTML client-side, like example tabs.
const { data } = await useAsyncData('migration', async () => {
  const { highlightCode } = await import('~/utils/highlight');

  const html: Record<string, string> = {};

  for (const section of sections) {
    for (const [sectionFlavor, blocks] of Object.entries(section.blocks)) {
      for (const [index, block] of blocks.entries()) {
        html[`${section.id}:${sectionFlavor}:${index}`] = await highlightCode(
          block.code,
          block.lang,
        );
      }
    }
  }

  return html;
});

const blocksHtml = computed(() => data.value ?? {});

useHead({ title: 'Migration guide — CSC Design System' });
</script>
