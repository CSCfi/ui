<template>
  <div v-if="parentView" class="page-with-rail">
    <article>
      <h1><code>&lt;{{ parentView.tagName }}&gt;</code></h1>

      <p v-if="parentView.description" class="lead preline">
        {{ parentView.description }}
      </p>

      <section v-if="usageHtml" class="doc-section">
        <h2 id="usage">Usage</h2>
        <!-- eslint-disable-next-line vue/no-v-html — our markdown, html disabled, code Shiki-highlighted at prerender -->
        <div class="usage" v-html="usageHtml" />
      </section>

      <section v-if="examples.length" class="doc-section">
        <h2 id="examples">Examples</h2>
        <ExampleBlock
          v-for="example in examples"
          :key="example.name"
          :example="example"
          :html="examplesHtml[example.name]"
        />
      </section>

      <section class="doc-section">
        <h2 id="api">API reference</h2>
        <ApiComponent
          v-for="view in views"
          :key="view.tagName"
          :linkable-types="pageTypeNames"
          :types-html="typesHtml"
          :view="view"
        />
      </section>
    </article>

    <aside class="toc" aria-label="On this page">
      <p class="toc-heading">On this page</p>
      <nav>
        <a v-if="usageHtml" class="toc-link" href="#usage">Usage</a>
        <a v-if="examples.length" class="toc-link" href="#examples">Examples</a>
        <a class="toc-link" href="#api">API reference</a>
        <template v-for="view in views" :key="view.tagName">
          <a class="toc-link toc-component" :href="`#${view.tagName}`">
            {{ view.tagName }}
          </a>
          <a
            v-for="section in view.sections"
            :key="section.id"
            class="toc-link toc-sub"
            :href="`#${section.id}`"
          >
            {{ section.label }}
          </a>
        </template>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { toComponentView, useManifest } from '~/composables/useManifest';

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

  const examplesHtml: Record<string, Record<string, string>> = {};

  for (const example of examples) {
    const byLabel: Record<string, string> = {};

    for (const t of example.tabs) {
      byLabel[t.label] = await highlightCode(t.code, t.lang);
    }

    examplesHtml[example.name] = byLabel;
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

useHead({ title: `${tag} — CSC Design System` });
</script>
