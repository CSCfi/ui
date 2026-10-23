<template>
  <div class="flex items-start gap-10">
    <article class="max-w-[52rem] min-w-0 flex-1">
      <h1 class="mb-[0.67em] text-[2rem] font-bold">Migration guide</h1>

      <p class="my-[1em] max-w-[45rem] text-[1.0625rem] text-on-surface-muted">
        How to upgrade an app from
        <code>@cscfi/csc-ui</code>
        3.x (the Stencil implementation) to the rewritten 4.x — same package
        name, new major version. The
        <code>&lt;c-*&gt;</code>
        tag names are unchanged; what changes is registration, two-way binding,
        customization, and theming. Pick your flavor with the switcher in the
        header (or below on small screens).
      </p>

      <flavor-switcher class="md:hidden" />

      <section v-for="section in sections" :key="section.id" class="mt-10">
        <h2
          :id="section.id"
          class="my-[0.83em] scroll-mt-20 border-b border-border pb-1.5 text-2xl font-bold"
        >
          {{ section.title }}
        </h2>

        <p class="my-[1em] max-w-180 whitespace-pre-line text-on-surface-muted">
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
          <nuxt-link :to="section.link.to" class="font-semibold underline">
            {{ section.link.label }} →
          </nuxt-link>
        </p>
      </section>

      <section class="mt-10">
        <h2
          id="v3-api"
          class="my-[0.83em] scroll-mt-20 border-b border-border pb-1.5 text-2xl font-bold"
        >
          3.x API, name by name
        </h2>

        <p class="my-[1em] max-w-180 text-on-surface-muted">
          Every 3.x tag, attribute, event, method, slot and CSS custom property
          that 4.x removed, renamed or changed the default or type of, and the
          ones whose behaviour changed under the same name. Attributes are
          listed by their 3.x attribute name.
        </p>

        <div v-for="group in apiGroups" :key="group.tag">
          <h3
            :id="`v3-api-${group.tag === '*' ? 'all' : group.tag}`"
            :class="{ 'font-mono': group.tag !== '*' }"
            class="mt-8 mb-2 scroll-mt-20 text-lg font-bold"
          >
            {{ group.tag === '*' ? 'Every component' : group.tag }}
          </h3>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr>
                  <th :class="TH">3.x</th>

                  <th :class="TH">Kind</th>

                  <th :class="TH">In 4.x</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="entry in group.entries"
                  :key="`${entry.kind} ${entry.name}`"
                >
                  <td :class="TD">
                    <code class="whitespace-nowrap">{{ nameOf(entry) }}</code>
                  </td>

                  <td :class="TD" class="whitespace-nowrap">
                    {{ KIND_LABELS[entry.kind] }}
                  </td>

                  <td :class="TD">
                    <template
                      v-for="(part, index) in entry.change.split('`')"
                      :key="index"
                    >
                      <code v-if="index % 2">{{ part }}</code>

                      <template v-else>{{ part }}</template>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </article>

    <toc-rail :items="tocItems" />
  </div>
</template>

<script setup lang="ts">
import type { TocItem } from '~/utils/toc';

import { MIGRATION_SECTIONS, type MigrationSection } from '~/content/migration';
import {
  V3_API_CHANGES,
  type V3ApiChange,
  type V3ApiKind,
} from '~/content/migration-api';

const sections: MigrationSection[] = MIGRATION_SECTIONS;

// "On this page" rail links — one per section, then the name-by-name lookup.
const tocItems: TocItem[] = [
  ...sections.map((section) => ({ id: section.id, label: section.title })),
  { id: 'v3-api', label: '3.x API, name by name' },
];

const KIND_LABELS: Record<V3ApiKind, string> = {
  cssProperty: 'CSS custom property',
  event: 'Event',
  method: 'Method',
  prop: 'Attribute',
  slot: 'Slot',
  tag: 'Tag',
};

const KIND_ORDER: V3ApiKind[] = [
  'tag',
  'prop',
  'event',
  'method',
  'slot',
  'cssProperty',
];

const nameOf = (entry: V3ApiChange): string => {
  if (entry.kind === 'tag') return `<${entry.tag}>`;

  if (entry.name === '*') return 'all';

  if (entry.kind === 'slot' && entry.name === '') return 'default';

  return entry.name ?? '';
};

// One table per 3.x tag, the every-component entries first; in a table the
// tag itself, then kinds and names in order.
const apiGroups = Object.entries(
  Object.groupBy(V3_API_CHANGES, (entry) => entry.tag),
)
  .map(([tag, entries = []]) => ({
    entries: entries.toSorted(
      (a, b) =>
        KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
        (a.name ?? '').localeCompare(b.name ?? ''),
    ),
    tag,
  }))
  .toSorted((a, b) =>
    a.tag === '*' ? -1 : b.tag === '*' ? 1 : a.tag.localeCompare(b.tag),
  );

const TH =
  'border-b border-border px-3 py-2 text-left align-top font-semibold whitespace-nowrap text-on-surface-faint';

const TD = 'border-b border-border px-3 py-2 text-left align-top';

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
