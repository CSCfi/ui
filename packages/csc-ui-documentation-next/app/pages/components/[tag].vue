<template>
  <div v-if="parentView" class="flex items-start gap-10">
    <article class="min-w-0 flex-1">
      <h1 class="mb-[0.67em] text-[2rem] font-bold">
        <code>&lt;{{ parentView.tagName }}&gt;</code>
      </h1>

      <p
        v-if="parentView.description"
        class="my-[1em] max-w-[45rem] whitespace-pre-line text-[1.0625rem] text-on-surface-muted"
      >
        {{ parentView.description }}
      </p>

      <section v-if="usageHtml" class="mt-10">
        <h2
          id="usage"
          class="my-[0.83em] scroll-mt-20 border-b border-border pb-1.5 text-2xl font-bold"
        >
          Usage
        </h2>
        <!-- eslint-disable-next-line vue/no-v-html — our markdown, html disabled, code Shiki-highlighted at prerender -->
        <div class="usage" v-html="usageHtml" />
      </section>

      <section v-if="examples.length" class="mt-10">
        <h2
          id="examples"
          class="my-[0.83em] scroll-mt-20 border-b border-border pb-1.5 text-2xl font-bold"
        >
          Examples
        </h2>

        <example-block
          v-for="example in examples"
          :key="example.name"
          :example="example"
          :html="examplesHtml[example.name]"
        />
      </section>

      <section class="mt-10">
        <h2
          id="api"
          class="my-[0.83em] scroll-mt-20 border-b border-border pb-1.5 text-2xl font-bold"
        >
          API reference
        </h2>

        <api-component
          v-for="view in views"
          :key="view.tagName"
          :linkable-types="pageTypeNames"
          :types-html="typesHtml"
          :view="view"
        />
      </section>
    </article>

    <toc-rail :items="tocItems" />
  </div>
</template>

<script setup lang="ts">
import { toComponentView, useManifest } from '~/composables/useManifest';
import type { TocItem } from '~/utils/toc';

const route = useRoute();

const tag = String(route.params.tag);

const { findComponent, parentOf, resolveGroup } = useManifest();

// A folded composed child has no page of its own — send it to its parent's
// group (ADR-0013). routeRules also covers direct static hits.
const parent = parentOf(tag);

if (parent) {
  await navigateTo(`/components/${parent}#${tag}`, { redirectCode: 301 });
}

const group = resolveGroup(tag);

if (!parent && (!group.length || !findComponent(tag))) {
  throw createError({
    fatal: true,
    statusCode: 404,
    statusMessage: 'Unknown component',
  });
}

// Types dedupe across the group: a type renders once per page, under the
// first (parent-first) component that documents it.
const claimedTypes = new Set<string>();

const views = group.map((c) => toComponentView(c, claimedTypes));

// Every type rendered somewhere on this page — type names appearing in prop
// type text link to these same-page anchors.
const pageTypeNames = [...claimedTypes];

const parentView = views[0];

const examples = useExamples(group.map((c) => c.tagName));

const usageSource = useUsageDoc(tag);

// Highlight (Shiki) + render markdown at prerender; serialized into the static
// payload so the client ships no highlighter. See utils/highlight.ts.
const { data } = await useAsyncData(`page-${tag}`, async () => {
  const { highlightCode, renderMarkdown } = await import('~/utils/highlight');

  const examplesHtml: Record<string, Record<string, string[]>> = {};

  for (const example of examples) {
    const byFlavor: Record<string, string[]> = {};

    for (const t of example.tabs) {
      byFlavor[t.flavor] = await Promise.all(
        t.panes.map((pane) => highlightCode(pane.code, pane.lang)),
      );
    }

    examplesHtml[example.name] = byFlavor;
  }

  const typesHtml: Record<string, string> = {};

  for (const view of views) {
    for (const apiType of view.types) {
      typesHtml[apiType.name] = await highlightCode(apiType.declaration, 'ts');
    }
  }

  return {
    examplesHtml,
    typesHtml,
    usageHtml: usageSource ? await renderMarkdown(usageSource) : null,
  };
});

const examplesHtml = computed(() => data.value?.examplesHtml ?? {});

const typesHtml = computed(() => data.value?.typesHtml ?? {});

const usageHtml = computed(() => data.value?.usageHtml ?? null);

// "On this page" rail links in document order (mirrors the template).
const tocItems = computed<TocItem[]>(() => {
  const items: TocItem[] = [];

  if (usageHtml.value) items.push({ id: 'usage', label: 'Usage' });

  if (examples.length) {
    items.push(
      { id: 'examples', label: 'Examples' },
      ...examples.map((example) => ({
        id: exampleAnchor(example.name),
        kind: 'sub' as const,
        label: example.title,
      })),
    );
  }

  items.push({ id: 'api', label: 'API reference' });

  for (const view of views) {
    items.push(
      { id: view.tagName, kind: 'component', label: view.tagName },
      ...view.sections.map((section) => ({
        id: section.id,
        kind: 'sub' as const,
        label: section.label,
      })),
    );
  }

  return items;
});

useHead({ title: `${tag} — CSC Design System` });
</script>
